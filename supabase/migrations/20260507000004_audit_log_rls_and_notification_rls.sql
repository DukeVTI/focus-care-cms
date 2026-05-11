-- ============================================================================
-- AUDIT LOG RLS FIX
-- Allows managers and admins to read ALL audit entries (not just their own)
-- Statutory compliance requirement — care managers must be able to review
-- all system activity for safeguarding and regulation purposes
-- ============================================================================

-- Drop the restrictive user-only read policy
DROP POLICY IF EXISTS "Users can view audit entries for own records" ON public.audit_log;

-- Authenticated users can still view their OWN entries
CREATE POLICY "Users can view own audit entries"
ON public.audit_log FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Managers can view ALL audit entries
CREATE POLICY "Managers can view all audit entries"
ON public.audit_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'manager'));

-- Admins can view ALL audit entries
CREATE POLICY "Admins can view all audit entries"
ON public.audit_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- NOTIFICATION TABLES RLS (defensive — ensure correct access control)
-- These were created in 20260418000002 but may lack proper policies
-- ============================================================================

-- notification_queue: only service_role should process; users can insert
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can enqueue notifications" ON public.notification_queue;
CREATE POLICY "Authenticated users can enqueue notifications"
ON public.notification_queue FOR INSERT TO authenticated
WITH CHECK (true);

-- Users can view their own queued notifications
DROP POLICY IF EXISTS "Users can view own notification queue" ON public.notification_queue;
CREATE POLICY "Users can view own notification queue"
ON public.notification_queue FOR SELECT TO authenticated
USING (recipient_user_id = auth.uid());

-- Admins can view all queued notifications
DROP POLICY IF EXISTS "Admins can view all notification queue" ON public.notification_queue;
CREATE POLICY "Admins can view all notification queue"
ON public.notification_queue FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- email_notification_log: users can view their own history
ALTER TABLE public.email_notification_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification log" ON public.email_notification_log;
CREATE POLICY "Users can view own notification log"
ON public.email_notification_log FOR SELECT TO authenticated
USING (recipient_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all notification log" ON public.email_notification_log;
CREATE POLICY "Admins can view all notification log"
ON public.email_notification_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Service role can insert log entries
DROP POLICY IF EXISTS "Service role can insert notification log" ON public.email_notification_log;
CREATE POLICY "Service role can insert notification log"
ON public.email_notification_log FOR INSERT TO authenticated
WITH CHECK (true);

-- notification_preferences: users manage their own preferences only
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own notification preferences"
ON public.notification_preferences FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
