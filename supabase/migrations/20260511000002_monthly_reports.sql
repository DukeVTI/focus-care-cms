-- ============================================================================
-- MONTHLY REPORTS ENGINE
-- Phase 2: LLM Service Table and Cron Automation
-- ============================================================================

CREATE TABLE public.monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id) ON DELETE CASCADE,
  report_month DATE NOT NULL, -- Stored as the first of the month
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  utilization_metrics JSONB DEFAULT '{}'::jsonb,
  ai_draft_content TEXT,
  final_content TEXT,
  smart_goals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(young_person_id, report_month)
);

-- Update trigger
CREATE TRIGGER handle_monthly_reports_updated_at
  BEFORE UPDATE ON public.monthly_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports for their assigned young people"
ON public.monthly_reports FOR SELECT
TO authenticated
USING (
  young_person_id IN (
    SELECT id FROM public.young_people WHERE user_id = auth.uid()
  ) OR (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'manager'))
  )
);

CREATE POLICY "Users can insert/update reports for their assigned young people"
ON public.monthly_reports FOR INSERT
TO authenticated
WITH CHECK (
  young_person_id IN (
    SELECT id FROM public.young_people WHERE user_id = auth.uid()
  ) OR (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'manager'))
  )
);

CREATE POLICY "Users can update reports for their assigned young people"
ON public.monthly_reports FOR UPDATE
TO authenticated
USING (
  young_person_id IN (
    SELECT id FROM public.young_people WHERE user_id = auth.uid()
  ) OR (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'manager'))
  )
);

-- Note: The cron automation will be scheduled via the Supabase dashboard or via pg_cron extension
-- Example: SELECT cron.schedule('generate_monthly_reports', '0 1 1 * *', $$ select net.http_post(url:='https://project-ref.supabase.co/functions/v1/generate-monthly-report', headers:='{"Authorization": "Bearer ..."}') $$);
