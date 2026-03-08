
-- Add new Focus Sheet columns to young_people table
ALTER TABLE public.young_people
  ADD COLUMN IF NOT EXISTS social_media_accounts jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exploitation_categories text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS exploitation_notes text,
  ADD COLUMN IF NOT EXISTS yot_involved boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS yot_worker_name text,
  ADD COLUMN IF NOT EXISTS yot_worker_phone text,
  ADD COLUMN IF NOT EXISTS yot_worker_email text,
  ADD COLUMN IF NOT EXISTS probation_order text,
  ADD COLUMN IF NOT EXISTS probation_end_date date,
  ADD COLUMN IF NOT EXISTS structured_ids jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS associated_areas text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS associated_areas_notes text;
