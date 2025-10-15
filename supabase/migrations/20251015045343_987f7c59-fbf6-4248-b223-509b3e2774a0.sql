-- Add new columns to tasks table for enhanced task management
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS assignee_type text CHECK (assignee_type IN ('STAFF_GENERAL', 'STAFF_NAMED', 'YP', 'SOCIAL_WORKER', 'PA')),
  ADD COLUMN IF NOT EXISTS assigned_to_user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS expected_completion date,
  ADD COLUMN IF NOT EXISTS date_actioned timestamp with time zone,
  ADD COLUMN IF NOT EXISTS support_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS supporter_role text CHECK (supporter_role IN ('SUPPORT_WORKER', 'KEYWORKER', 'STAFF_ON_SHIFT')),
  ADD COLUMN IF NOT EXISTS reassigned_history jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid REFERENCES auth.users(id);

-- Update status column to support new values (OPEN, IN_PROGRESS, DONE, ARCHIVED)
ALTER TABLE public.tasks 
  DROP CONSTRAINT IF EXISTS tasks_status_check,
  ADD CONSTRAINT tasks_status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'OPEN', 'IN_PROGRESS', 'DONE', 'ARCHIVED'));

-- Update importance column to enforce enum-like values
ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_importance_check,
  ADD CONSTRAINT tasks_importance_check CHECK (importance IN ('Low', 'Medium', 'High', 'LOW', 'MEDIUM', 'HIGH'));

-- Migrate existing data
UPDATE public.tasks SET
  assignee_type = 'STAFF_NAMED',
  assigned_to_user_id = assigned_to,
  expected_completion = due_date,
  support_required = CASE WHEN requires_support = 'Yes' THEN true ELSE false END,
  created_by_user_id = assigned_to,
  status = CASE 
    WHEN status = 'pending' THEN 'OPEN'
    WHEN status = 'in_progress' THEN 'IN_PROGRESS'
    WHEN status = 'completed' THEN 'DONE'
    ELSE status
  END
WHERE assignee_type IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_type ON public.tasks(assignee_type);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_expected_completion ON public.tasks(expected_completion);