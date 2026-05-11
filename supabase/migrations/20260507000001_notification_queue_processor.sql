-- ============================================================================
-- NOTIFICATION QUEUE PROCESSOR
-- Processes pending notifications by calling the send-notification edge function
-- This function is called by pg_cron every 5 minutes
-- ============================================================================

-- Enable the pg_net extension (must be done in Supabase Dashboard first)
-- Dashboard → Database → Extensions → enable "pg_net"

-- Function to process the notification queue
CREATE OR REPLACE FUNCTION public.process_notification_queue()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification RECORD;
  v_processed integer := 0;
  v_failed integer := 0;
  v_supabase_url text;
  v_anon_key text;
BEGIN
  -- Get config values from vault (set these in Supabase Dashboard → Settings → Vault)
  v_supabase_url := current_setting('app.supabase_url', true);
  v_anon_key := current_setting('app.anon_key', true);

  -- Process up to 50 pending notifications per run
  FOR v_notification IN
    SELECT id, notification_type, recipient_email, recipient_user_id, payload
    FROM public.notification_queue
    WHERE status = 'pending'
      AND scheduled_for <= now()
      AND retry_count < max_retries
    ORDER BY scheduled_for ASC
    LIMIT 50
  LOOP
    -- Mark as processing
    UPDATE public.notification_queue
    SET status = 'processing', updated_at = now()
    WHERE id = v_notification.id;

    BEGIN
      -- Call the send-notification edge function via pg_net
      -- Note: pg_net is async; actual send happens in background
      PERFORM net.http_post(
        url := v_supabase_url || '/functions/v1/send-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_anon_key
        ),
        body := jsonb_build_object(
          'notification_type', v_notification.notification_type,
          'recipient_email', v_notification.recipient_email,
          'payload', v_notification.payload
        )
      );

      -- Mark as sent (optimistically — pg_net is fire-and-forget)
      UPDATE public.notification_queue
      SET
        status = 'sent',
        processed_at = now(),
        updated_at = now()
      WHERE id = v_notification.id;

      -- Log to email_notification_log
      INSERT INTO public.email_notification_log (
        recipient_email,
        recipient_user_id,
        notification_type,
        subject,
        status,
        sent_at
      ) VALUES (
        v_notification.recipient_email,
        v_notification.recipient_user_id,
        v_notification.notification_type,
        v_notification.notification_type || ' notification',
        'sent',
        now()
      );

      v_processed := v_processed + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Increment retry count, mark as pending again
      UPDATE public.notification_queue
      SET
        status = 'pending',
        retry_count = retry_count + 1,
        error_message = SQLERRM,
        updated_at = now()
      WHERE id = v_notification.id;

      v_failed := v_failed + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'processed', v_processed,
    'failed', v_failed,
    'ran_at', now()
  );
END;
$$;

-- Grant execute to service role
GRANT EXECUTE ON FUNCTION public.process_notification_queue() TO service_role;
