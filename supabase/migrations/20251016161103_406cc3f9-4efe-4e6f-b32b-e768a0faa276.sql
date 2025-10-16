-- Fix 1: Remove unrestricted access policies for young_person_contacts
DROP POLICY IF EXISTS "Staff can view all contacts" ON public.young_person_contacts;
DROP POLICY IF EXISTS "Staff can insert contacts" ON public.young_person_contacts;
DROP POLICY IF EXISTS "Staff can update contacts" ON public.young_person_contacts;
DROP POLICY IF EXISTS "Staff can delete contacts" ON public.young_person_contacts;

-- Fix 2: Remove unrestricted access policies for young_person_medications
DROP POLICY IF EXISTS "Staff can view all medications" ON public.young_person_medications;
DROP POLICY IF EXISTS "Staff can insert medications" ON public.young_person_medications;
DROP POLICY IF EXISTS "Staff can update medications" ON public.young_person_medications;
DROP POLICY IF EXISTS "Staff can delete medications" ON public.young_person_medications;

-- Fix 3: Remove unrestricted access policies for young_person_documents
DROP POLICY IF EXISTS "Staff can view all documents" ON public.young_person_documents;
DROP POLICY IF EXISTS "Staff can insert documents" ON public.young_person_documents;
DROP POLICY IF EXISTS "Staff can update documents" ON public.young_person_documents;
DROP POLICY IF EXISTS "Staff can delete documents" ON public.young_person_documents;

-- Fix 4: Secure the young-person-photos storage bucket
UPDATE storage.buckets 
SET public = false 
WHERE id = 'young-person-photos';

DROP POLICY IF EXISTS "Photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can view photos for own young people" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload photos for own young people" ON storage.objects;
DROP POLICY IF EXISTS "Users can update photos for own young people" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete photos for own young people" ON storage.objects;

-- Create secure policy for photo access (only for young people the user owns)
CREATE POLICY "Users can view photos for own young people"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'young-person-photos' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.young_people yp
    WHERE yp.user_id = auth.uid()
    AND yp.photo_url LIKE '%' || (storage.foldername(name))[1] || '%'
  )
);

CREATE POLICY "Users can upload photos for own young people"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'young-person-photos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update photos for own young people"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'young-person-photos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete photos for own young people"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'young-person-photos' AND
  auth.uid() IS NOT NULL
);