-- Add missing fields to young_person_contacts table
ALTER TABLE public.young_person_contacts
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS organisation TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Add severity field to safeguarding_risks table
ALTER TABLE public.safeguarding_risks
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High'));

-- Add index for primary contacts
CREATE INDEX IF NOT EXISTS idx_young_person_contacts_primary 
ON public.young_person_contacts(young_person_id, is_primary) 
WHERE is_primary = true;

-- Add index for active safeguarding risks
CREATE INDEX IF NOT EXISTS idx_safeguarding_risks_active 
ON public.safeguarding_risks(young_person_id, is_active) 
WHERE is_active = true;