-- Add missing fields to keywork_sessions table for standards framework and task allocation

-- Add standards framework field
ALTER TABLE public.keywork_sessions 
ADD COLUMN IF NOT EXISTS standards_framework TEXT;

-- Add standards referenced array
ALTER TABLE public.keywork_sessions 
ADD COLUMN IF NOT EXISTS standards_referenced TEXT[] DEFAULT '{}';

-- Convert standards_met to array if it's still text
ALTER TABLE public.keywork_sessions 
ALTER COLUMN standards_met TYPE TEXT[] USING 
  CASE 
    WHEN standards_met IS NULL THEN '{}'::TEXT[]
    WHEN standards_met = '' THEN '{}'::TEXT[]
    ELSE ARRAY[standards_met]
  END;

-- Set default for standards_met
ALTER TABLE public.keywork_sessions 
ALTER COLUMN standards_met SET DEFAULT '{}';

-- Add outcomes field
ALTER TABLE public.keywork_sessions 
ADD COLUMN IF NOT EXISTS outcomes TEXT;

-- Add requires_task field
ALTER TABLE public.keywork_sessions 
ADD COLUMN IF NOT EXISTS requires_task BOOLEAN DEFAULT false;

-- Add task_allocation_role field
ALTER TABLE public.keywork_sessions 
ADD COLUMN IF NOT EXISTS task_allocation_role TEXT;

-- Add follow_up_notes field (separate from notes)
ALTER TABLE public.keywork_sessions 
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;

-- Add index for filtering by standards
CREATE INDEX IF NOT EXISTS idx_keywork_sessions_standards 
ON public.keywork_sessions(standards_framework);

-- Add comment for documentation
COMMENT ON COLUMN public.keywork_sessions.standards_framework IS 'SupportedAccommodation or ChildrensHome';
COMMENT ON COLUMN public.keywork_sessions.standards_referenced IS 'Array of standards referenced in the session';
COMMENT ON COLUMN public.keywork_sessions.standards_met IS 'Array of standards met/achieved in the session';
COMMENT ON COLUMN public.keywork_sessions.task_allocation_role IS 'Role to assign task to: Key Worker, Social Worker, etc.';