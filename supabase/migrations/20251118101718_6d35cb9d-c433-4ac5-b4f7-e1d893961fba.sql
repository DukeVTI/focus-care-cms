-- Add new fields to chronology_entries table
ALTER TABLE public.chronology_entries
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS entry_type text,
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS flagged_for_report boolean DEFAULT false;

-- Add index for better query performance on filters
CREATE INDEX IF NOT EXISTS idx_chronology_category ON public.chronology_entries(category);
CREATE INDEX IF NOT EXISTS idx_chronology_entry_type ON public.chronology_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_chronology_flagged ON public.chronology_entries(flagged_for_report);

-- Update existing entries with default values
UPDATE public.chronology_entries
SET 
  category = 'General',
  entry_type = 'Observation',
  summary = SUBSTRING(observation, 1, 100)
WHERE category IS NULL OR entry_type IS NULL OR summary IS NULL;