-- ============================================================================
-- ESCALATION & NOTIFICATION CRON JOBS (Tier 3)
--
-- PREREQUISITES (manual steps in Supabase Dashboard):
--   1. Dashboard → Database → Extensions → Enable "pg_cron"
--   2. Dashboard → Database → Extensions → Enable "pg_net"
--   3. Set Supabase secrets:
--      Dashboard → Edge Functions → Secrets:
--        RESEND_API_KEY = <your Resend API key>
--
-- After running this migration, verify jobs in Supabase:
--   SELECT * FROM cron.job;
-- ============================================================================

-- ============================================================================
-- JOB 1: Escalation Check — runs every hour
-- Escalates open missing episodes >24h, flags overdue tasks
-- ============================================================================
SELECT cron.schedule(
  'focuscms-escalation-check',         -- unique job name
  '0 * * * *',                         -- every hour at :00
  $$
  SELECT net.http_post(
    url      := (SELECT setting FROM pg_settings WHERE name = 'app.supabase_url') || '/functions/v1/escalation-check',
    headers  := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT setting FROM pg_settings WHERE name = 'app.anon_key')
    ),
    body     := '{}'::jsonb
  );
  $$
);

-- ============================================================================
-- JOB 2: Notification Queue Processor — runs every 5 minutes
-- Sends queued email notifications via the send-notification edge function
-- ============================================================================
SELECT cron.schedule(
  'focuscms-notification-processor',   -- unique job name
  '*/5 * * * *',                       -- every 5 minutes
  $$SELECT public.process_notification_queue();$$
);

-- ============================================================================
-- JOB 3: Calendar & Task Reminder Enqueuer — runs every 6 hours
-- Queues 24h/48h reminder emails for upcoming calendar events and due tasks
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enqueue_upcoming_reminders()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event RECORD;
  v_task RECORD;
  v_user_email text;
  v_reminders_queued integer := 0;
  v_hours_until interval;
  v_now timestamptz := now();
BEGIN

  -- ── Calendar event reminders ──────────────────────────────────────────────
  FOR v_event IN
    SELECT
      ce.id,
      ce.title,
      ce.event_date,
      ce.event_time,
      ce.location,
      ce.created_by,
      ce.young_person_id
    FROM public.calendar_events ce
    WHERE ce.status = 'scheduled'
      AND ce.event_date >= CURRENT_DATE
      AND ce.event_date <= CURRENT_DATE + INTERVAL '2 days'
      AND NOT EXISTS (
        -- Don't re-queue if we already sent a reminder for this event today
        SELECT 1 FROM public.notification_queue nq
        WHERE nq.status IN ('sent', 'pending', 'processing')
          AND nq.payload->>'calendar_event_id' = ce.id::text
          AND nq.created_at >= v_now - INTERVAL '6 hours'
      )
  LOOP
    -- Get creator's email from profiles
    SELECT p.email INTO v_user_email
    FROM public.profiles p WHERE p.id = v_event.created_by;

    IF v_user_email IS NOT NULL THEN
      -- Calculate hours until event
      v_hours_until := (v_event.event_date + v_event.event_time::time) - v_now;

      INSERT INTO public.notification_queue (
        notification_type,
        recipient_email,
        recipient_user_id,
        payload,
        scheduled_for
      ) VALUES (
        CASE
          WHEN EXTRACT(EPOCH FROM v_hours_until)/3600 <= 24 THEN 'calendar_24h_reminder'
          ELSE 'calendar_48h_reminder'
        END,
        v_user_email,
        v_event.created_by,
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

  -- ── Task due reminders ────────────────────────────────────────────────────
  FOR v_task IN
    SELECT
      t.id,
      t.title,
      t.due_date,
      t.assigned_to,
      t.young_person_id
    FROM public.tasks t
    WHERE t.status NOT IN ('completed', 'archived', 'DONE', 'ARCHIVED')
      AND t.due_date IS NOT NULL
      AND t.due_date >= CURRENT_DATE
      AND t.due_date <= CURRENT_DATE + INTERVAL '2 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.notification_queue nq
        WHERE nq.status IN ('sent', 'pending', 'processing')
          AND nq.payload->>'task_id' = t.id::text
          AND nq.created_at >= v_now - INTERVAL '6 hours'
      )
  LOOP
    SELECT p.email INTO v_user_email
    FROM public.profiles p WHERE p.id = v_task.assigned_to;

    IF v_user_email IS NOT NULL THEN
      INSERT INTO public.notification_queue (
        notification_type,
        recipient_email,
        recipient_user_id,
        payload,
        scheduled_for
      ) VALUES (
        'task_due',
        v_user_email,
        v_task.assigned_to,
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

-- Schedule the reminder enqueuer every 6 hours
SELECT cron.schedule(
  'focuscms-reminder-enqueuer',
  '0 */6 * * *',
  $$SELECT public.enqueue_upcoming_reminders();$$
);
