
-- Add escalation and workflow columns to missing_episodes
ALTER TABLE public.missing_episodes 
  ADD COLUMN IF NOT EXISTS escalation_level text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS escalated_at timestamptz,
  ADD COLUMN IF NOT EXISTS return_interview_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS return_interview_date timestamptz,
  ADD COLUMN IF NOT EXISTS return_interview_notes text,
  ADD COLUMN IF NOT EXISTS manager_approved boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS manager_approved_by uuid,
  ADD COLUMN IF NOT EXISTS manager_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS linked_task_id uuid REFERENCES public.tasks(id),
  ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS clothing_description text,
  ADD COLUMN IF NOT EXISTS distinguishing_features text,
  ADD COLUMN IF NOT EXISTS known_associates text,
  ADD COLUMN IF NOT EXISTS likely_destinations text,
  ADD COLUMN IF NOT EXISTS transport_mode text,
  ADD COLUMN IF NOT EXISTS social_worker_notified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS social_worker_notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS placing_authority_notified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS placing_authority_notified_at timestamptz;
