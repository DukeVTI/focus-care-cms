
-- Add enhanced columns to young_person_documents
ALTER TABLE public.young_person_documents
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS uploaded_by uuid,
  ADD COLUMN IF NOT EXISTS uploaded_by_name text,
  ADD COLUMN IF NOT EXISTS action_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS action_notes text,
  ADD COLUMN IF NOT EXISTS file_size bigint;

-- Create RLS-compatible index for category filtering
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.young_person_documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_action ON public.young_person_documents(action_required) WHERE action_required = true;
