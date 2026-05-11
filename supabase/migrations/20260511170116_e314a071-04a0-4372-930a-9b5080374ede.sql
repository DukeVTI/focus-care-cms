CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- =============== 20260418000001: calendar columns ===============
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS activity_type TEXT DEFAULT 'other';
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS meeting_type TEXT;
CREATE INDEX IF NOT EXISTS idx_calendar_events_activity_type ON public.calendar_events(activity_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON public.calendar_events(status);

-- =============== 20260418000002: notification tables ===============
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_health_crisis BOOLEAN DEFAULT true,
  notify_health_updates BOOLEAN DEFAULT true,
  notify_calendar_created BOOLEAN DEFAULT true,
  notify_calendar_24h BOOLEAN DEFAULT true,
  notify_calendar_48h BOOLEAN DEFAULT false,
  notify_task_assigned BOOLEAN DEFAULT true,
  notify_task_due BOOLEAN DEFAULT true,
  notify_task_48h BOOLEAN DEFAULT false,
  notify_risk_updated BOOLEAN DEFAULT true,
  notify_risk_high BOOLEAN DEFAULT true,
  notify_document_uploaded BOOLEAN DEFAULT true,
  digest_enabled BOOLEAN DEFAULT false,
  digest_frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own preferences" ON public.notification_preferences;
CREATE POLICY "Users can view own preferences" ON public.notification_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own preferences" ON public.notification_preferences;
CREATE POLICY "Users can update own preferences" ON public.notification_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own preferences" ON public.notification_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.email_notification_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  health_entry_id UUID REFERENCES public.health_condition_entries(id) ON DELETE SET NULL,
  calendar_event_id UUID REFERENCES public.calendar_events(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  risk_assessment_id UUID REFERENCES public.risk_assessments(id) ON DELETE SET NULL,
  young_person_id UUID REFERENCES public.young_people(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'queued',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON public.email_notification_log(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON public.email_notification_log(notification_type);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON public.email_notification_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON public.email_notification_log(created_at);
ALTER TABLE public.email_notification_log ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON public.notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created ON public.notification_queue(created_at);

GRANT SELECT, INSERT ON public.notification_queue TO authenticated;
GRANT SELECT, UPDATE ON public.email_notification_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;

-- =============== 20260507000001: queue processor ===============
CREATE OR REPLACE FUNCTION public.process_notification_queue()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification RECORD;
  v_processed integer := 0;
  v_failed integer := 0;
  v_supabase_url text;
  v_anon_key text;
BEGIN
  v_supabase_url := current_setting('app.supabase_url', true);
  v_anon_key := current_setting('app.anon_key', true);
  FOR v_notification IN
    SELECT id, notification_type, recipient_email, recipient_user_id, payload
    FROM public.notification_queue
    WHERE status = 'pending' AND scheduled_for <= now() AND retry_count < max_retries
    ORDER BY scheduled_for ASC LIMIT 50
  LOOP
    UPDATE public.notification_queue SET status = 'processing', updated_at = now() WHERE id = v_notification.id;
    BEGIN
      PERFORM net.http_post(
        url := v_supabase_url || '/functions/v1/send-notification',
        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || v_anon_key),
        body := jsonb_build_object(
          'notification_type', v_notification.notification_type,
          'recipient_email', v_notification.recipient_email,
          'payload', v_notification.payload
        )
      );
      UPDATE public.notification_queue SET status='sent', processed_at=now(), updated_at=now() WHERE id = v_notification.id;
      INSERT INTO public.email_notification_log (recipient_email, recipient_user_id, notification_type, subject, status, sent_at)
      VALUES (v_notification.recipient_email, v_notification.recipient_user_id, v_notification.notification_type, v_notification.notification_type || ' notification', 'sent', now());
      v_processed := v_processed + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.notification_queue SET status='pending', retry_count=retry_count+1, error_message=SQLERRM, updated_at=now() WHERE id = v_notification.id;
      v_failed := v_failed + 1;
    END;
  END LOOP;
  RETURN jsonb_build_object('processed', v_processed, 'failed', v_failed, 'ran_at', now());
END;
$$;
GRANT EXECUTE ON FUNCTION public.process_notification_queue() TO service_role;

-- =============== 20260507000002: cron schedules ===============
CREATE OR REPLACE FUNCTION public.enqueue_upcoming_reminders()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event RECORD;
  v_task RECORD;
  v_user_email text;
  v_reminders_queued integer := 0;
  v_hours_until interval;
  v_now timestamptz := now();
BEGIN
  FOR v_event IN
    SELECT ce.id, ce.title, ce.event_date, ce.event_time, ce.location, ce.created_by, ce.young_person_id
    FROM public.calendar_events ce
    WHERE ce.status = 'scheduled'
      AND ce.event_date >= CURRENT_DATE
      AND ce.event_date <= CURRENT_DATE + INTERVAL '2 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.notification_queue nq
        WHERE nq.status IN ('sent','pending','processing')
          AND nq.payload->>'calendar_event_id' = ce.id::text
          AND nq.created_at >= v_now - INTERVAL '6 hours'
      )
  LOOP
    SELECT p.email INTO v_user_email FROM public.profiles p WHERE p.id = v_event.created_by;
    IF v_user_email IS NOT NULL THEN
      v_hours_until := (v_event.event_date + COALESCE(v_event.event_time::time, '00:00'::time)) - v_now;
      INSERT INTO public.notification_queue (notification_type, recipient_email, recipient_user_id, payload, scheduled_for)
      VALUES (
        CASE WHEN EXTRACT(EPOCH FROM v_hours_until)/3600 <= 24 THEN 'calendar_24h_reminder' ELSE 'calendar_48h_reminder' END,
        v_user_email, v_event.created_by,
        jsonb_build_object(
          'event_title', v_event.title,
          'event_date', v_event.event_date::text,
          'event_time', COALESCE(v_event.event_time::text, ''),
          'location', COALESCE(v_event.location, 'Not specified'),
          'hours_until_event', ROUND(EXTRACT(EPOCH FROM v_hours_until)/3600),
          'calendar_event_id', v_event.id::text
        ),
        v_now
      );
      v_reminders_queued := v_reminders_queued + 1;
    END IF;
  END LOOP;
  FOR v_task IN
    SELECT t.id, t.title, t.due_date, t.assigned_to, t.young_person_id
    FROM public.tasks t
    WHERE t.status NOT IN ('completed','archived','DONE','ARCHIVED')
      AND t.due_date IS NOT NULL
      AND t.due_date >= CURRENT_DATE
      AND t.due_date <= CURRENT_DATE + INTERVAL '2 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.notification_queue nq
        WHERE nq.status IN ('sent','pending','processing')
          AND nq.payload->>'task_id' = t.id::text
          AND nq.created_at >= v_now - INTERVAL '6 hours'
      )
  LOOP
    SELECT p.email INTO v_user_email FROM public.profiles p WHERE p.id = v_task.assigned_to;
    IF v_user_email IS NOT NULL THEN
      INSERT INTO public.notification_queue (notification_type, recipient_email, recipient_user_id, payload, scheduled_for)
      VALUES (
        'task_due', v_user_email, v_task.assigned_to,
        jsonb_build_object(
          'task_title', v_task.title,
          'task_id', v_task.id::text,
          'due_date', v_task.due_date::text,
          'hours_until_due', GREATEST(0, ROUND(EXTRACT(EPOCH FROM (v_task.due_date - CURRENT_DATE)) / 3600))
        ),
        v_now
      );
      v_reminders_queued := v_reminders_queued + 1;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('reminders_queued', v_reminders_queued, 'ran_at', v_now);
END;
$$;
GRANT EXECUTE ON FUNCTION public.enqueue_upcoming_reminders() TO service_role;

-- Cron jobs (idempotent: unschedule then schedule)
DO $$ BEGIN
  PERFORM cron.unschedule('focuscms-escalation-check');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
SELECT cron.schedule('focuscms-escalation-check','0 * * * *',
  $cmd$ SELECT net.http_post(
    url := (SELECT setting FROM pg_settings WHERE name='app.supabase_url') || '/functions/v1/escalation-check',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || (SELECT setting FROM pg_settings WHERE name='app.anon_key')),
    body := '{}'::jsonb
  ); $cmd$);

DO $$ BEGIN
  PERFORM cron.unschedule('focuscms-notification-processor');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
SELECT cron.schedule('focuscms-notification-processor','*/5 * * * *', $cmd$SELECT public.process_notification_queue();$cmd$);

DO $$ BEGIN
  PERFORM cron.unschedule('focuscms-reminder-enqueuer');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
SELECT cron.schedule('focuscms-reminder-enqueuer','0 */6 * * *', $cmd$SELECT public.enqueue_upcoming_reminders();$cmd$);

-- =============== 20260507000003: full-text search ===============
ALTER TABLE public.chronology_entries ADD COLUMN IF NOT EXISTS fts_vector tsvector;
UPDATE public.chronology_entries SET fts_vector = to_tsvector('english',
  COALESCE(summary,'') || ' ' || COALESCE(observation,'') || ' ' || COALESCE(category,''))
WHERE fts_vector IS NULL;
CREATE INDEX IF NOT EXISTS idx_chronology_fts ON public.chronology_entries USING GIN(fts_vector);

CREATE OR REPLACE FUNCTION public.update_chronology_fts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.fts_vector := to_tsvector('english',
    COALESCE(NEW.summary,'') || ' ' || COALESCE(NEW.observation,'') || ' ' || COALESCE(NEW.category,''));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS chronology_fts_update ON public.chronology_entries;
CREATE TRIGGER chronology_fts_update BEFORE INSERT OR UPDATE ON public.chronology_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_chronology_fts();

ALTER TABLE public.young_people ADD COLUMN IF NOT EXISTS fts_vector tsvector;
UPDATE public.young_people SET fts_vector = to_tsvector('english',
  COALESCE(first_name,'') || ' ' || COALESCE(last_name,'') || ' ' || COALESCE(focus_id,'') || ' ' || COALESCE(placing_authority,'') || ' ' || COALESCE(social_worker_name,''))
WHERE fts_vector IS NULL;
CREATE INDEX IF NOT EXISTS idx_young_people_fts ON public.young_people USING GIN(fts_vector);

CREATE OR REPLACE FUNCTION public.update_young_people_fts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.fts_vector := to_tsvector('english',
    COALESCE(NEW.first_name,'') || ' ' || COALESCE(NEW.last_name,'') || ' ' || COALESCE(NEW.focus_id,'') || ' ' || COALESCE(NEW.placing_authority,'') || ' ' || COALESCE(NEW.social_worker_name,''));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS young_people_fts_update ON public.young_people;
CREATE TRIGGER young_people_fts_update BEFORE INSERT OR UPDATE ON public.young_people
  FOR EACH ROW EXECUTE FUNCTION public.update_young_people_fts();

CREATE INDEX IF NOT EXISTS idx_tasks_title_search ON public.tasks USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_missing_case_id ON public.missing_episodes (case_id);
CREATE INDEX IF NOT EXISTS idx_risk_level ON public.risk_assessments (risk_level, assessment_date DESC);

-- =============== 20260507000004: audit log + notification RLS ===============
DROP POLICY IF EXISTS "Users can view audit entries for own records" ON public.audit_log;
DROP POLICY IF EXISTS "Users can view own audit entries" ON public.audit_log;
CREATE POLICY "Users can view own audit entries" ON public.audit_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Managers can view all audit entries" ON public.audit_log;
CREATE POLICY "Managers can view all audit entries" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'manager'));
DROP POLICY IF EXISTS "Admins can view all audit entries" ON public.audit_log;
CREATE POLICY "Admins can view all audit entries" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can enqueue notifications" ON public.notification_queue;
CREATE POLICY "Authenticated users can enqueue notifications" ON public.notification_queue FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view own notification queue" ON public.notification_queue;
CREATE POLICY "Users can view own notification queue" ON public.notification_queue FOR SELECT TO authenticated USING (recipient_user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can view all notification queue" ON public.notification_queue;
CREATE POLICY "Admins can view all notification queue" ON public.notification_queue FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view notifications for their data" ON public.email_notification_log;
DROP POLICY IF EXISTS "Users can view own notification log" ON public.email_notification_log;
CREATE POLICY "Users can view own notification log" ON public.email_notification_log FOR SELECT TO authenticated USING (recipient_user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can view all notification log" ON public.email_notification_log;
CREATE POLICY "Admins can view all notification log" ON public.email_notification_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Service role can insert notification log" ON public.email_notification_log;
CREATE POLICY "Service role can insert notification log" ON public.email_notification_log FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =============== 20260508000001: automation triggers ===============
CREATE OR REPLACE FUNCTION public.handle_missing_episode_return()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_assigned_user_id UUID;
BEGIN
  IF NEW.status = 'returned' AND OLD.status = 'missing' THEN
    SELECT user_id INTO v_assigned_user_id FROM public.young_people WHERE id = NEW.young_person_id;
    IF v_assigned_user_id IS NOT NULL THEN
      INSERT INTO public.tasks (young_person_id, assigned_to, title, description, importance, requires_support, status, due_date)
      VALUES (NEW.young_person_id, v_assigned_user_id,
        'URGENT: Risk Assessment Update (Missing Episode Return)',
        'Young person returned from missing episode ' || COALESCE(NEW.case_id,'') || '. Statutory guidelines require Risk Assessment update within 24 hours.',
        'High','Yes','pending', CURRENT_DATE + INTERVAL '1 day');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_missing_episode_returned ON public.missing_episodes;
CREATE TRIGGER on_missing_episode_returned AFTER UPDATE OF status ON public.missing_episodes
  FOR EACH ROW EXECUTE FUNCTION public.handle_missing_episode_return();

CREATE OR REPLACE FUNCTION public.handle_health_crisis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_assigned_user_id UUID;
BEGIN
  IF NEW.rating = 5 THEN
    SELECT user_id INTO v_assigned_user_id FROM public.young_people WHERE id = NEW.young_person_id;
    IF v_assigned_user_id IS NOT NULL THEN
      INSERT INTO public.tasks (young_person_id, assigned_to, title, description, importance, requires_support, status, due_date)
      VALUES (NEW.young_person_id, v_assigned_user_id,
        'URGENT: Risk Assessment Review (Health Crisis)',
        'A level 5 health crisis was recorded for ' || NEW.category || ' - ' || NEW.condition_name || '. Please review and update the Risk Assessment immediately.',
        'High','Yes','pending', CURRENT_DATE);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_health_crisis_recorded ON public.health_condition_entries;
CREATE TRIGGER on_health_crisis_recorded AFTER INSERT OR UPDATE OF rating ON public.health_condition_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_health_crisis();

-- =============== 20260511000001: document action trigger ===============
CREATE OR REPLACE FUNCTION public.handle_document_action_required()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_assigned_user_id UUID;
BEGIN
  IF NEW.action_required = true AND (TG_OP = 'INSERT' OR OLD.action_required = false) THEN
    SELECT user_id INTO v_assigned_user_id FROM public.young_people WHERE id = NEW.young_person_id;
    IF v_assigned_user_id IS NOT NULL THEN
      INSERT INTO public.tasks (young_person_id, assigned_to, title, description, importance, requires_support, status, due_date)
      VALUES (NEW.young_person_id, v_assigned_user_id,
        'Action Required: Document ' || NEW.file_name,
        COALESCE(NEW.action_notes, 'A document requires your attention. Category: ' || NEW.category),
        'Medium','No','pending', CURRENT_DATE + INTERVAL '3 days');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_document_action_required ON public.young_person_documents;
CREATE TRIGGER on_document_action_required AFTER INSERT OR UPDATE OF action_required ON public.young_person_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_document_action_required();

-- =============== 20260511000002: monthly reports ===============
CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  report_month DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  utilization_metrics JSONB DEFAULT '{}'::jsonb,
  ai_draft_content TEXT,
  final_content TEXT,
  smart_goals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(young_person_id, report_month)
);
DROP TRIGGER IF EXISTS handle_monthly_reports_updated_at ON public.monthly_reports;
CREATE TRIGGER handle_monthly_reports_updated_at BEFORE UPDATE ON public.monthly_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view reports for their assigned young people" ON public.monthly_reports;
CREATE POLICY "Users can view reports for their assigned young people" ON public.monthly_reports FOR SELECT TO authenticated
USING (
  young_person_id IN (SELECT id FROM public.young_people WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

DROP POLICY IF EXISTS "Users can insert/update reports for their assigned young people" ON public.monthly_reports;
CREATE POLICY "Users can insert reports for their assigned young people" ON public.monthly_reports FOR INSERT TO authenticated
WITH CHECK (
  young_person_id IN (SELECT id FROM public.young_people WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

DROP POLICY IF EXISTS "Users can update reports for their assigned young people" ON public.monthly_reports;
CREATE POLICY "Users can update reports for their assigned young people" ON public.monthly_reports FOR UPDATE TO authenticated
USING (
  young_person_id IN (SELECT id FROM public.young_people WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);