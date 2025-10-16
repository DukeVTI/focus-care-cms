-- Add tags column to chronology_entries
ALTER TABLE public.chronology_entries
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add index for better tag filtering performance
CREATE INDEX IF NOT EXISTS idx_chronology_tags ON public.chronology_entries USING GIN(tags);

-- Add author_name column to store the author's name
ALTER TABLE public.chronology_entries
ADD COLUMN IF NOT EXISTS author_name text;