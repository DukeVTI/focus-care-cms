-- Create safeguarding_risks table for tracking individual risks per young person
CREATE TABLE IF NOT EXISTS public.safeguarding_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  risk_category TEXT NOT NULL,
  description TEXT NOT NULL,
  mitigation_plan TEXT,
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.safeguarding_risks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for safeguarding_risks
CREATE POLICY "Users can view risks for own young people"
  ON public.safeguarding_risks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.young_people yp
      WHERE yp.id = safeguarding_risks.young_person_id
      AND yp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create risks for own young people"
  ON public.safeguarding_risks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.young_people yp
      WHERE yp.id = safeguarding_risks.young_person_id
      AND yp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update risks for own young people"
  ON public.safeguarding_risks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.young_people yp
      WHERE yp.id = safeguarding_risks.young_person_id
      AND yp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete risks for own young people"
  ON public.safeguarding_risks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.young_people yp
      WHERE yp.id = safeguarding_risks.young_person_id
      AND yp.user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER handle_safeguarding_risks_updated_at
  BEFORE UPDATE ON public.safeguarding_risks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();