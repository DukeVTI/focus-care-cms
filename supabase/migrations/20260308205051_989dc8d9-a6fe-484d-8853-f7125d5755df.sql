
-- Health Condition Entries table (Physical, Substance, Mental Health)
CREATE TABLE public.health_condition_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'physical', 'substance', 'mental_health'
  condition_name TEXT NOT NULL,
  free_text_condition TEXT,
  rating INTEGER NOT NULL DEFAULT 1, -- 1-5 severity scale
  comment TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Medical Appointment Logs table
CREATE TABLE public.medical_appointment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  visit_type TEXT NOT NULL, -- 'gp', 'hospital', 'dental', 'optician'
  date_of_visit DATE NOT NULL,
  provider_name TEXT NOT NULL,
  outcome_notes TEXT,
  next_appointment_date DATE,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_condition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_appointment_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for health_condition_entries
CREATE POLICY "Users can view health entries for own young people"
ON public.health_condition_entries FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.young_people yp
  WHERE yp.id = health_condition_entries.young_person_id AND yp.user_id = auth.uid()
));

CREATE POLICY "Users can insert health entries for own young people"
ON public.health_condition_entries FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.young_people yp
  WHERE yp.id = health_condition_entries.young_person_id AND yp.user_id = auth.uid()
));

CREATE POLICY "Users can update health entries for own young people"
ON public.health_condition_entries FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.young_people yp
  WHERE yp.id = health_condition_entries.young_person_id AND yp.user_id = auth.uid()
));

CREATE POLICY "Users can delete health entries for own young people"
ON public.health_condition_entries FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.young_people yp
  WHERE yp.id = health_condition_entries.young_person_id AND yp.user_id = auth.uid()
));

-- RLS policies for medical_appointment_logs
CREATE POLICY "Users can view medical logs for own young people"
ON public.medical_appointment_logs FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.young_people yp
  WHERE yp.id = medical_appointment_logs.young_person_id AND yp.user_id = auth.uid()
));

CREATE POLICY "Users can insert medical logs for own young people"
ON public.medical_appointment_logs FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.young_people yp
  WHERE yp.id = medical_appointment_logs.young_person_id AND yp.user_id = auth.uid()
));

CREATE POLICY "Users can update medical logs for own young people"
ON public.medical_appointment_logs FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.young_people yp
  WHERE yp.id = medical_appointment_logs.young_person_id AND yp.user_id = auth.uid()
));

CREATE POLICY "Users can delete medical logs for own young people"
ON public.medical_appointment_logs FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.young_people yp
  WHERE yp.id = medical_appointment_logs.young_person_id AND yp.user_id = auth.uid()
));

-- Updated_at triggers
CREATE TRIGGER handle_health_condition_entries_updated_at
  BEFORE UPDATE ON public.health_condition_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_medical_appointment_logs_updated_at
  BEFORE UPDATE ON public.medical_appointment_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
