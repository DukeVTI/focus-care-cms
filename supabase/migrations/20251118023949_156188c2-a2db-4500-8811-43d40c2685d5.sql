-- Add new fields to missing_episodes table for enhanced tracking
ALTER TABLE public.missing_episodes 
  ADD COLUMN IF NOT EXISTS case_id TEXT,
  ADD COLUMN IF NOT EXISTS edt_contact TEXT,
  ADD COLUMN IF NOT EXISTS found_by TEXT,
  ADD COLUMN IF NOT EXISTS found_location TEXT,
  ADD COLUMN IF NOT EXISTS return_reason TEXT,
  ADD COLUMN IF NOT EXISTS risks_encountered TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_actions TEXT;

-- Create sequence for case ID generation
CREATE SEQUENCE IF NOT EXISTS missing_episode_case_seq START 1;

-- Function to generate case IDs like MEP-2025-0001
CREATE OR REPLACE FUNCTION generate_missing_case_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
  year_str TEXT;
BEGIN
  -- Get next sequence number
  SELECT nextval('missing_episode_case_seq') INTO next_num;
  
  -- Get current year
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Format: MEP-YYYY-0001
  RETURN 'MEP-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;

-- Trigger to auto-generate case_id on insert
CREATE OR REPLACE FUNCTION set_missing_case_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.case_id IS NULL THEN
    NEW.case_id := generate_missing_case_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER missing_episode_case_id_trigger
BEFORE INSERT ON public.missing_episodes
FOR EACH ROW
EXECUTE FUNCTION set_missing_case_id();

-- Backfill case_id for existing records without one
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT id FROM public.missing_episodes WHERE case_id IS NULL
  LOOP
    UPDATE public.missing_episodes 
    SET case_id = generate_missing_case_id()
    WHERE id = rec.id;
  END LOOP;
END $$;