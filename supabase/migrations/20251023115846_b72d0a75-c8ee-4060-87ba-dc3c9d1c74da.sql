-- Add new placement and authority fields
ALTER TABLE public.young_people
ADD COLUMN IF NOT EXISTS placing_authority TEXT,
ADD COLUMN IF NOT EXISTS residing_local_authority TEXT,
ADD COLUMN IF NOT EXISTS previous_placement TEXT,
ADD COLUMN IF NOT EXISTS reason_for_placement TEXT;

-- Add demographics and identity fields
ALTER TABLE public.young_people
ADD COLUMN IF NOT EXISTS social_media TEXT,
ADD COLUMN IF NOT EXISTS id_details TEXT;

-- Add health support field
ALTER TABLE public.young_people
ADD COLUMN IF NOT EXISTS health_support TEXT;

-- Add safeguarding/offending fields
ALTER TABLE public.young_people
ADD COLUMN IF NOT EXISTS offending_history TEXT,
ADD COLUMN IF NOT EXISTS offending_details JSONB;