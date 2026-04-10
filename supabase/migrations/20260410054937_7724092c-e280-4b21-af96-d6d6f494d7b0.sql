
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL,
  mood_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  mood_label TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(young_person_id, mood_date)
);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mood entries for own young people"
ON public.mood_entries FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM young_people yp WHERE yp.id = mood_entries.young_person_id AND yp.user_id = auth.uid()));

CREATE POLICY "Users can insert mood entries for own young people"
ON public.mood_entries FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM young_people yp WHERE yp.id = mood_entries.young_person_id AND yp.user_id = auth.uid()));

CREATE POLICY "Users can update mood entries for own young people"
ON public.mood_entries FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM young_people yp WHERE yp.id = mood_entries.young_person_id AND yp.user_id = auth.uid()));

CREATE POLICY "Users can delete mood entries for own young people"
ON public.mood_entries FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM young_people yp WHERE yp.id = mood_entries.young_person_id AND yp.user_id = auth.uid()));

CREATE TRIGGER update_mood_entries_updated_at
BEFORE UPDATE ON public.mood_entries
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
