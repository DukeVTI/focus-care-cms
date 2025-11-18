-- Add new columns to young_people table for Focus Sheet updates

-- ID Details split into type and value
ALTER TABLE young_people ADD COLUMN IF NOT EXISTS id_type TEXT;
ALTER TABLE young_people ADD COLUMN IF NOT EXISTS id_value TEXT;

-- Immigration and Care Legal Status
ALTER TABLE young_people ADD COLUMN IF NOT EXISTS immigration_legal_status TEXT;
ALTER TABLE young_people ADD COLUMN IF NOT EXISTS care_legal_status TEXT;

-- Length of time looked after
ALTER TABLE young_people ADD COLUMN IF NOT EXISTS time_looked_after TEXT;

-- Reason for placement notes (for "Other" option)
ALTER TABLE young_people ADD COLUMN IF NOT EXISTS reason_for_placement_notes TEXT;

-- Update the old id_details field to be nullable for backward compatibility
ALTER TABLE young_people ALTER COLUMN id_details DROP NOT NULL;