-- Email Notification System Tables

-- ============================================================================
-- EMAIL NOTIFICATION TYPES & PREFERENCES
-- ============================================================================

-- Table to store notification preferences per user
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Health & Wellbeing notifications
  notify_health_crisis BOOLEAN DEFAULT true,
  notify_health_updates BOOLEAN DEFAULT true,
  
  -- Calendar notifications
  notify_calendar_created BOOLEAN DEFAULT true,
  notify_calendar_24h BOOLEAN DEFAULT true,
  notify_calendar_48h BOOLEAN DEFAULT false,
  
  -- Task notifications
  notify_task_assigned BOOLEAN DEFAULT true,
  notify_task_due BOOLEAN DEFAULT true,
  notify_task_48h BOOLEAN DEFAULT false,
  
  -- Risk assessment notifications
  notify_risk_updated BOOLEAN DEFAULT true,
  notify_risk_high BOOLEAN DEFAULT true,
  
  -- Document notifications
  notify_document_uploaded BOOLEAN DEFAULT true,
  
  -- Email digest settings
  digest_enabled BOOLEAN DEFAULT false,
  digest_frequency TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'never'
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.notification_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.notification_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.notification_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- EMAIL NOTIFICATION LOG
-- ============================================================================

-- Table to track sent notifications for auditing and preventing duplicates
CREATE TABLE public.email_notification_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  notification_type TEXT NOT NULL, -- 'health_crisis', 'calendar_created', 'task_assigned', etc.
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  
  -- Context references
  health_entry_id UUID REFERENCES public.health_condition_entries(id) ON DELETE SET NULL,
  calendar_event_id UUID REFERENCES public.calendar_events(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  risk_assessment_id UUID REFERENCES public.risk_assessments(id) ON DELETE SET NULL,
  young_person_id UUID REFERENCES public.young_people(id) ON DELETE SET NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'queued', -- 'queued', 'sent', 'failed', 'bounced'
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_log_recipient ON public.email_notification_log(recipient_email);
CREATE INDEX idx_email_log_type ON public.email_notification_log(notification_type);
CREATE INDEX idx_email_log_status ON public.email_notification_log(status);
CREATE INDEX idx_email_log_created ON public.email_notification_log(created_at);

ALTER TABLE public.email_notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications for their data" ON public.email_notification_log
  FOR SELECT TO authenticated
  USING (
    auth.uid() = recipient_user_id OR
    auth.uid() IN (SELECT user_id FROM public.young_people WHERE id = young_person_id)
  );

-- ============================================================================
-- NOTIFICATION QUEUE (for async processing)
-- ============================================================================

CREATE TABLE public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  notification_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  payload JSONB NOT NULL, -- Flexible payload for different notification types
  
  -- Timing
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed'
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX idx_notification_queue_scheduled ON public.notification_queue(scheduled_for);
CREATE INDEX idx_notification_queue_created ON public.notification_queue(created_at);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT ON public.notification_queue TO authenticated, anon;
GRANT SELECT, UPDATE ON public.email_notification_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
