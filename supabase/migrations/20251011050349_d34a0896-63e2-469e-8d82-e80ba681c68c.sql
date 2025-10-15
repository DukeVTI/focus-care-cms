-- Expand young_people table with all new fields
ALTER TABLE public.young_people
ADD COLUMN IF NOT EXISTS preferred_name TEXT,
ADD COLUMN IF NOT EXISTS pronouns TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS ethnicity TEXT,
ADD COLUMN IF NOT EXISTS primary_language TEXT,
ADD COLUMN IF NOT EXISTS interpreter_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS photo_consent TEXT CHECK (photo_consent IN ('yes', 'no', 'not_obtained')),
ADD COLUMN IF NOT EXISTS age INTEGER,

-- Legal & Care Status
ADD COLUMN IF NOT EXISTS placement_type TEXT NOT NULL DEFAULT 'foster',
ADD COLUMN IF NOT EXISTS placement_start_date DATE,
ADD COLUMN IF NOT EXISTS legal_status TEXT,
ADD COLUMN IF NOT EXISTS looked_after_child BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS iro_name TEXT,
ADD COLUMN IF NOT EXISTS next_lac_review_date DATE,
ADD COLUMN IF NOT EXISTS court_orders TEXT,

-- Key Contacts
ADD COLUMN IF NOT EXISTS social_worker_name TEXT,
ADD COLUMN IF NOT EXISTS social_worker_email TEXT,
ADD COLUMN IF NOT EXISTS social_worker_phone TEXT,
ADD COLUMN IF NOT EXISTS key_worker_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS gp_practice TEXT,
ADD COLUMN IF NOT EXISTS school_college TEXT,

-- Health & Wellbeing
ADD COLUMN IF NOT EXISTS medical_conditions TEXT[],
ADD COLUMN IF NOT EXISTS allergies TEXT[],
ADD COLUMN IF NOT EXISTS mental_health_support BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mental_health_service TEXT,
ADD COLUMN IF NOT EXISTS mental_health_worker TEXT,
ADD COLUMN IF NOT EXISTS mental_health_next_appointment DATE,
ADD COLUMN IF NOT EXISTS disability_needs TEXT[],

-- Education
ADD COLUMN IF NOT EXISTS education_setting TEXT,
ADD COLUMN IF NOT EXISTS year_group TEXT,
ADD COLUMN IF NOT EXISTS ehcp_status TEXT CHECK (ehcp_status IN ('yes', 'no', 'pending')),
ADD COLUMN IF NOT EXISTS ehcp_review_date DATE,
ADD COLUMN IF NOT EXISTS attendance_concerns BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS attendance_description TEXT,

-- Safeguarding
ADD COLUMN IF NOT EXISTS known_risks TEXT[],
ADD COLUMN IF NOT EXISTS triggers TEXT,
ADD COLUMN IF NOT EXISTS protective_factors TEXT,
ADD COLUMN IF NOT EXISTS initial_risk_summary TEXT,

-- Culture & Preferences
ADD COLUMN IF NOT EXISTS religion TEXT,
ADD COLUMN IF NOT EXISTS dietary_requirements TEXT[],
ADD COLUMN IF NOT EXISTS activities_interests TEXT[],
ADD COLUMN IF NOT EXISTS communication_preferences TEXT[],

-- System & Assignment
ADD COLUMN IF NOT EXISTS assigned_team TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'all_staff',
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS focus_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS draft BOOLEAN DEFAULT false;

-- Create medications table
CREATE TABLE IF NOT EXISTS public.young_person_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create emergency contacts table
CREATE TABLE IF NOT EXISTS public.young_person_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  notes TEXT,
  is_emergency BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS public.young_person_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.young_person_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.young_person_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.young_person_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications
CREATE POLICY "Users can view medications for own young people"
ON public.young_person_medications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_medications.young_person_id
    AND yp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert medications for own young people"
ON public.young_person_medications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_medications.young_person_id
    AND yp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update medications for own young people"
ON public.young_person_medications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_medications.young_person_id
    AND yp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete medications for own young people"
ON public.young_person_medications FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_medications.young_person_id
    AND yp.user_id = auth.uid()
  )
);

-- RLS Policies for contacts
CREATE POLICY "Users can view contacts for own young people"
ON public.young_person_contacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_contacts.young_person_id
    AND yp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert contacts for own young people"
ON public.young_person_contacts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_contacts.young_person_id
    AND yp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update contacts for own young people"
ON public.young_person_contacts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_contacts.young_person_id
    AND yp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete contacts for own young people"
ON public.young_person_contacts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_contacts.young_person_id
    AND yp.user_id = auth.uid()
  )
);

-- RLS Policies for documents
CREATE POLICY "Users can view documents for own young people"
ON public.young_person_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_documents.young_person_id
    AND yp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert documents for own young people"
ON public.young_person_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_documents.young_person_id
    AND yp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents for own young people"
ON public.young_person_documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_documents.young_person_id
    AND yp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents for own young people"
ON public.young_person_documents FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.id = young_person_documents.young_person_id
    AND yp.user_id = auth.uid()
  )
);

-- Function to auto-generate FOCUS ID
CREATE OR REPLACE FUNCTION public.generate_focus_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.focus_id IS NULL THEN
    NEW.focus_id := 'YP' || LPAD(NEXTVAL('young_people_id_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for FOCUS ID
CREATE SEQUENCE IF NOT EXISTS young_people_id_seq START 1;

-- Trigger to auto-generate FOCUS ID
DROP TRIGGER IF EXISTS set_focus_id ON public.young_people;
CREATE TRIGGER set_focus_id
  BEFORE INSERT ON public.young_people
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_focus_id();

-- Function to auto-calculate age
CREATE OR REPLACE FUNCTION public.calculate_age()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.age := EXTRACT(YEAR FROM AGE(NEW.date_of_birth));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate age
DROP TRIGGER IF EXISTS set_age ON public.young_people;
CREATE TRIGGER set_age
  BEFORE INSERT OR UPDATE OF date_of_birth ON public.young_people
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_age();

-- Triggers for updated_at
CREATE TRIGGER update_young_person_medications_updated_at
  BEFORE UPDATE ON public.young_person_medications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_young_person_contacts_updated_at
  BEFORE UPDATE ON public.young_person_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_young_person_documents_updated_at
  BEFORE UPDATE ON public.young_person_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('young-person-photos', 'young-person-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('young-person-documents', 'young-person-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for photos
CREATE POLICY "Users can upload photos for own young people"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'young-person-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view photos for own young people"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'young-person-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update photos for own young people"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'young-person-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete photos for own young people"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'young-person-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for documents
CREATE POLICY "Users can upload documents for own young people"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'young-person-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view documents for own young people"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'young-person-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update documents for own young people"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'young-person-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete documents for own young people"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'young-person-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);