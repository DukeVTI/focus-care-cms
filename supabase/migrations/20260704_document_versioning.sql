-- Add versioning support to young_person_documents table
-- This migration adds document version tracking and duplicate prevention

-- Add new columns for versioning and tracking
ALTER TABLE public.young_person_documents
ADD COLUMN IF NOT EXISTS is_latest BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS previous_version_id UUID REFERENCES public.young_person_documents(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Add storage_path if it doesn't exist (for file tracking)
ALTER TABLE public.young_person_documents
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Add category column if it doesn't exist (for duplicate detection)
ALTER TABLE public.young_person_documents
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create unique constraint to prevent exact duplicates within same young person + category
-- This will prevent uploading the exact same filename in the same category
ALTER TABLE public.young_person_documents
ADD CONSTRAINT unique_doc_per_yp_category 
UNIQUE(young_person_id, category, file_name)
DEFERRABLE INITIALLY DEFERRED;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_young_person_latest
ON public.young_person_documents(young_person_id, is_latest);

CREATE INDEX IF NOT EXISTS idx_documents_category
ON public.young_person_documents(category);

CREATE INDEX IF NOT EXISTS idx_documents_previous_version
ON public.young_person_documents(previous_version_id);

-- Create a version history view for auditing
CREATE OR REPLACE VIEW document_version_history AS
SELECT 
  d.id,
  d.young_person_id,
  d.file_name,
  d.category,
  d.created_at,
  d.uploaded_by AS created_by,
  d.is_latest,
  ROW_NUMBER() OVER (
    PARTITION BY d.young_person_id, d.category, d.file_name 
    ORDER BY d.created_at DESC
  ) as version_number
FROM public.young_person_documents d
ORDER BY d.young_person_id, d.file_name, d.created_at DESC;

-- Grant permissions
GRANT SELECT ON public.document_version_history TO authenticated;

-- Add comment explaining the versioning system
COMMENT ON COLUMN public.young_person_documents.is_latest IS 'Marks whether this is the current version of a document';
COMMENT ON COLUMN public.young_person_documents.previous_version_id IS 'References the previous version of this document for audit trail';
COMMENT ON COLUMN public.young_person_documents.file_size IS 'Size of uploaded file in bytes';
COMMENT ON COLUMN public.young_person_documents.storage_path IS 'Path to file in cloud storage for retrieval';
COMMENT ON COLUMN public.young_person_documents.category IS 'Document category for organization and duplicate detection';
