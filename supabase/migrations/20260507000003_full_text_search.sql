-- ============================================================================
-- FULL-TEXT SEARCH INDEXES (Tier 5)
--
-- Adds PostgreSQL GIN-based tsvector columns + triggers for fast
-- full-text search across chronology entries and young people.
--
-- The GlobalSearch React component uses ilike queries as a simpler
-- cross-table approach that works without FTS columns.
-- This migration adds GIN indexes to make those ilike queries faster
-- and also creates proper FTS vectors for future enhanced search.
-- ============================================================================

-- ── Chronology entries FTS ────────────────────────────────────────────────────

ALTER TABLE public.chronology_entries
  ADD COLUMN IF NOT EXISTS fts_vector tsvector;

-- Populate existing rows
UPDATE public.chronology_entries
SET fts_vector = to_tsvector('english',
  COALESCE(summary, '') || ' ' || COALESCE(observation, '') || ' ' || COALESCE(category, '')
);

-- GIN index for fast FTS queries
CREATE INDEX IF NOT EXISTS idx_chronology_fts
  ON public.chronology_entries USING GIN(fts_vector);

-- Trigger to keep vectors updated
CREATE OR REPLACE FUNCTION public.update_chronology_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts_vector := to_tsvector('english',
    COALESCE(NEW.summary, '') || ' ' || COALESCE(NEW.observation, '') || ' ' || COALESCE(NEW.category, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chronology_fts_update ON public.chronology_entries;
CREATE TRIGGER chronology_fts_update
  BEFORE INSERT OR UPDATE ON public.chronology_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_chronology_fts();

-- ── Young people FTS ─────────────────────────────────────────────────────────

ALTER TABLE public.young_people
  ADD COLUMN IF NOT EXISTS fts_vector tsvector;

UPDATE public.young_people
SET fts_vector = to_tsvector('english',
  COALESCE(first_name, '') || ' ' ||
  COALESCE(last_name, '') || ' ' ||
  COALESCE(focus_id, '') || ' ' ||
  COALESCE(placing_authority, '') || ' ' ||
  COALESCE(social_worker_name, '')
);

CREATE INDEX IF NOT EXISTS idx_young_people_fts
  ON public.young_people USING GIN(fts_vector);

CREATE OR REPLACE FUNCTION public.update_young_people_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts_vector := to_tsvector('english',
    COALESCE(NEW.first_name, '') || ' ' ||
    COALESCE(NEW.last_name, '') || ' ' ||
    COALESCE(NEW.focus_id, '') || ' ' ||
    COALESCE(NEW.placing_authority, '') || ' ' ||
    COALESCE(NEW.social_worker_name, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS young_people_fts_update ON public.young_people;
CREATE TRIGGER young_people_fts_update
  BEFORE INSERT OR UPDATE ON public.young_people
  FOR EACH ROW EXECUTE FUNCTION public.update_young_people_fts();

-- ── Optimised ilike indexes ───────────────────────────────────────────────────
-- These support the GlobalSearch component's ilike queries on columns
-- that don't benefit from FTS (short identifiers, codes).

CREATE INDEX IF NOT EXISTS idx_tasks_title_search
  ON public.tasks USING GIN(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_missing_case_id
  ON public.missing_episodes (case_id);

CREATE INDEX IF NOT EXISTS idx_risk_level
  ON public.risk_assessments (risk_level, assessment_date DESC);
