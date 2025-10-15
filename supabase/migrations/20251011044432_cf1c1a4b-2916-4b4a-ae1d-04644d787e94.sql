-- Create young_people table
CREATE TABLE public.young_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  placement_info TEXT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  importance TEXT NOT NULL CHECK (importance IN ('Low', 'Medium', 'High')),
  requires_support TEXT NOT NULL CHECK (requires_support IN ('Yes', 'No')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'archived')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create keywork_sessions table
CREATE TABLE public.keywork_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  topic TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('Planned', 'Unplanned')),
  standards_met TEXT,
  notes TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create risk_assessments table
CREATE TABLE public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  assessed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High')),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors TEXT,
  protective_factors TEXT,
  interventions_recommended TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chronology_entries table
CREATE TABLE public.chronology_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  entry_time TIME NOT NULL,
  observation TEXT NOT NULL,
  significance TEXT CHECK (significance IN ('Low', 'Medium', 'High')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create missing_episodes table
CREATE TABLE public.missing_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  missing_from TIMESTAMPTZ NOT NULL,
  returned_at TIMESTAMPTZ,
  missing_reason TEXT,
  last_known_location TEXT,
  outcome TEXT,
  police_notified BOOLEAN DEFAULT false,
  police_reference TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'missing' CHECK (status IN ('missing', 'returned', 'found')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.young_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywork_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chronology_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missing_episodes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for young_people
CREATE POLICY "Users can view own young people"
  ON public.young_people FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create young people"
  ON public.young_people FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own young people"
  ON public.young_people FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own young people"
  ON public.young_people FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view assigned tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = assigned_to);

CREATE POLICY "Users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = assigned_to);

CREATE POLICY "Users can update assigned tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = assigned_to);

CREATE POLICY "Users can delete assigned tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = assigned_to);

-- RLS Policies for keywork_sessions
CREATE POLICY "Users can view own sessions"
  ON public.keywork_sessions FOR SELECT
  USING (auth.uid() = staff_id);

CREATE POLICY "Users can create sessions"
  ON public.keywork_sessions FOR INSERT
  WITH CHECK (auth.uid() = staff_id);

CREATE POLICY "Users can update own sessions"
  ON public.keywork_sessions FOR UPDATE
  USING (auth.uid() = staff_id);

-- RLS Policies for risk_assessments
CREATE POLICY "Users can view own assessments"
  ON public.risk_assessments FOR SELECT
  USING (auth.uid() = assessed_by);

CREATE POLICY "Users can create assessments"
  ON public.risk_assessments FOR INSERT
  WITH CHECK (auth.uid() = assessed_by);

CREATE POLICY "Users can update own assessments"
  ON public.risk_assessments FOR UPDATE
  USING (auth.uid() = assessed_by);

-- RLS Policies for chronology_entries
CREATE POLICY "Users can view own entries"
  ON public.chronology_entries FOR SELECT
  USING (auth.uid() = staff_id);

CREATE POLICY "Users can create entries"
  ON public.chronology_entries FOR INSERT
  WITH CHECK (auth.uid() = staff_id);

CREATE POLICY "Users can update own entries"
  ON public.chronology_entries FOR UPDATE
  USING (auth.uid() = staff_id);

-- RLS Policies for missing_episodes
CREATE POLICY "Users can view own missing episodes"
  ON public.missing_episodes FOR SELECT
  USING (auth.uid() = reported_by);

CREATE POLICY "Users can create missing episodes"
  ON public.missing_episodes FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can update own missing episodes"
  ON public.missing_episodes FOR UPDATE
  USING (auth.uid() = reported_by);

-- Add triggers for updated_at
CREATE TRIGGER on_young_people_updated
  BEFORE UPDATE ON public.young_people
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_tasks_updated
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_keywork_sessions_updated
  BEFORE UPDATE ON public.keywork_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_risk_assessments_updated
  BEFORE UPDATE ON public.risk_assessments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_chronology_entries_updated
  BEFORE UPDATE ON public.chronology_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_missing_episodes_updated
  BEFORE UPDATE ON public.missing_episodes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();