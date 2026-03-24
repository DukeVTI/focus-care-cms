
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'meeting',
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  young_person_id UUID REFERENCES public.young_people(id) ON DELETE SET NULL,
  linked_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  participants UUID[] DEFAULT '{}',
  participant_names TEXT[] DEFAULT '{}',
  is_group_event BOOLEAN DEFAULT false,
  recurrence TEXT DEFAULT 'none',
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON public.calendar_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = ANY(participants));

CREATE POLICY "Users can create events" ON public.calendar_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON public.calendar_events
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON public.calendar_events
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
