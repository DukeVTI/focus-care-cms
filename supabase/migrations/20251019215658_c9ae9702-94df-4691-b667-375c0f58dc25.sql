-- Add placement detail fields to young_people table
ALTER TABLE public.young_people
ADD COLUMN IF NOT EXISTS placement_address TEXT,
ADD COLUMN IF NOT EXISTS placement_road_name TEXT,
ADD COLUMN IF NOT EXISTS placement_postcode TEXT;