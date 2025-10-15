-- Add missing columns to young_people table
ALTER TABLE public.young_people
ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS preferred_name TEXT,
ADD COLUMN IF NOT EXISTS pronouns TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS ethnicity TEXT,
ADD COLUMN IF NOT EXISTS primary_language TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS photo_consent TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS placement_type TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS legal_status TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS iro_name TEXT,
ADD COLUMN IF NOT EXISTS court_orders TEXT,
ADD COLUMN IF NOT EXISTS social_worker_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS social_worker_email TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS social_worker_phone TEXT,
ADD COLUMN IF NOT EXISTS gp_practice TEXT,
ADD COLUMN IF NOT EXISTS school_college TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mental_health_service TEXT,
ADD COLUMN IF NOT EXISTS mental_health_worker TEXT,
ADD COLUMN IF NOT EXISTS disability_needs TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS education_setting TEXT,
ADD COLUMN IF NOT EXISTS year_group TEXT,
ADD COLUMN IF NOT EXISTS ehcp_status TEXT,
ADD COLUMN IF NOT EXISTS attendance_concerns BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS attendance_description TEXT,
ADD COLUMN IF NOT EXISTS known_risks TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS triggers TEXT,
ADD COLUMN IF NOT EXISTS protective_factors TEXT,
ADD COLUMN IF NOT EXISTS initial_risk_summary TEXT,
ADD COLUMN IF NOT EXISTS religion TEXT,
ADD COLUMN IF NOT EXISTS dietary_requirements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS activities_interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS communication_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assigned_team TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'all_staff',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS draft BOOLEAN DEFAULT FALSE;

-- Remove NOT NULL constraint from columns that had defaults
ALTER TABLE public.young_people
ALTER COLUMN last_name DROP NOT NULL,
ALTER COLUMN placement_type DROP NOT NULL,
ALTER COLUMN legal_status DROP NOT NULL,
ALTER COLUMN social_worker_name DROP NOT NULL,
ALTER COLUMN social_worker_email DROP NOT NULL;

-- Create young_person_medications table
CREATE TABLE IF NOT EXISTS public.young_person_medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on medications
ALTER TABLE public.young_person_medications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for medications
CREATE POLICY "Staff can view all medications"
  ON public.young_person_medications FOR SELECT
  USING (true);

CREATE POLICY "Staff can insert medications"
  ON public.young_person_medications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can update medications"
  ON public.young_person_medications FOR UPDATE
  USING (true);

CREATE POLICY "Staff can delete medications"
  ON public.young_person_medications FOR DELETE
  USING (true);

-- Create young_person_contacts table
CREATE TABLE IF NOT EXISTS public.young_person_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  is_emergency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on contacts
ALTER TABLE public.young_person_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts
CREATE POLICY "Staff can view all contacts"
  ON public.young_person_contacts FOR SELECT
  USING (true);

CREATE POLICY "Staff can insert contacts"
  ON public.young_person_contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can update contacts"
  ON public.young_person_contacts FOR UPDATE
  USING (true);

CREATE POLICY "Staff can delete contacts"
  ON public.young_person_contacts FOR DELETE
  USING (true);

-- Create young_person_documents table
CREATE TABLE IF NOT EXISTS public.young_person_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on documents
ALTER TABLE public.young_person_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Staff can view all documents"
  ON public.young_person_documents FOR SELECT
  USING (true);

CREATE POLICY "Staff can insert documents"
  ON public.young_person_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can update documents"
  ON public.young_person_documents FOR UPDATE
  USING (true);

CREATE POLICY "Staff can delete documents"
  ON public.young_person_documents FOR DELETE
  USING (true);

-- Create storage buckets for photos and documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('young-person-photos', 'young-person-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('young-person-documents', 'young-person-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for photos (public readable)
CREATE POLICY "Photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'young-person-photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'young-person-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'young-person-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'young-person-photos' AND auth.uid() IS NOT NULL);

-- Create storage policies for documents (private)
CREATE POLICY "Authenticated users can view documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'young-person-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'young-person-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'young-person-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'young-person-documents' AND auth.uid() IS NOT NULL);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.young_person_medications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.young_person_contacts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.young_person_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();