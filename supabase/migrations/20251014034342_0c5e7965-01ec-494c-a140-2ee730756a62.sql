-- Add new fields to keywork_sessions table
ALTER TABLE public.keywork_sessions
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS relevant_standard text,
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS follow_on_action text,
ADD COLUMN IF NOT EXISTS linked_task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS author_name text;

-- Update session_type to only allow Planned/Unplanned
ALTER TABLE public.keywork_sessions
DROP CONSTRAINT IF EXISTS keywork_sessions_session_type_check;

ALTER TABLE public.keywork_sessions
ADD CONSTRAINT keywork_sessions_session_type_check 
CHECK (session_type IN ('Planned', 'Unplanned'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_keywork_sessions_young_person_date 
ON public.keywork_sessions(young_person_id, session_date DESC);

CREATE INDEX IF NOT EXISTS idx_keywork_sessions_linked_task 
ON public.keywork_sessions(linked_task_id) WHERE linked_task_id IS NOT NULL;