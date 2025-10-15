-- Add section scores and configuration support to risk_assessments
ALTER TABLE public.risk_assessments
ADD COLUMN IF NOT EXISTS section_scores JSONB,
ADD COLUMN IF NOT EXISTS recommendations TEXT,
ADD COLUMN IF NOT EXISTS follow_up_needed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS linked_task_id UUID REFERENCES tasks(id),
ADD COLUMN IF NOT EXISTS previous_level TEXT,
ADD COLUMN IF NOT EXISTS level_change_flag BOOLEAN DEFAULT false;

-- Create risk assessment config table for tenant-specific thresholds
CREATE TABLE IF NOT EXISTS public.risk_assessment_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sections JSONB NOT NULL DEFAULT '[
    {"key": "safety_missing", "label": "Safety & Missing Episodes", "weight": 1},
    {"key": "mental_health", "label": "Mental Health & Wellbeing", "weight": 1.2},
    {"key": "substance_use", "label": "Substance Use", "weight": 1.1},
    {"key": "peer_relationships", "label": "Peer/Relationship Risks", "weight": 0.9},
    {"key": "education", "label": "Education/Attendance Risks", "weight": 0.8},
    {"key": "online_safety", "label": "Online/Social Media Risks", "weight": 1},
    {"key": "environmental", "label": "Environmental/Family Factors", "weight": 1},
    {"key": "other", "label": "Other Identified Risks", "weight": 0.7}
  ]'::jsonb,
  thresholds JSONB NOT NULL DEFAULT '{"low": 10, "medium": 20, "high": 30}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on config table
ALTER TABLE public.risk_assessment_config ENABLE ROW LEVEL SECURITY;

-- Config policies
CREATE POLICY "Users can view own config"
ON public.risk_assessment_config
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config"
ON public.risk_assessment_config
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config"
ON public.risk_assessment_config
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to calculate risk level from score
CREATE OR REPLACE FUNCTION public.calculate_risk_level(score INTEGER, config_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  thresholds JSONB;
  low_threshold INTEGER;
  medium_threshold INTEGER;
BEGIN
  SELECT risk_assessment_config.thresholds INTO thresholds
  FROM public.risk_assessment_config
  WHERE id = config_id;
  
  IF thresholds IS NULL THEN
    -- Default thresholds
    low_threshold := 10;
    medium_threshold := 20;
  ELSE
    low_threshold := (thresholds->>'low')::INTEGER;
    medium_threshold := (thresholds->>'medium')::INTEGER;
  END IF;
  
  IF score < low_threshold THEN
    RETURN 'Low';
  ELSIF score < medium_threshold THEN
    RETURN 'Medium';
  ELSE
    RETURN 'High';
  END IF;
END;
$$;

-- Trigger to detect level changes
CREATE OR REPLACE FUNCTION public.check_risk_level_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  prev_assessment RECORD;
BEGIN
  -- Get previous assessment for same young person
  SELECT risk_level INTO prev_assessment
  FROM public.risk_assessments
  WHERE young_person_id = NEW.young_person_id
    AND id != NEW.id
  ORDER BY assessment_date DESC
  LIMIT 1;
  
  IF prev_assessment IS NOT NULL THEN
    NEW.previous_level := prev_assessment.risk_level;
    
    -- Flag if level increased to High
    IF prev_assessment.risk_level IN ('Low', 'Medium') AND NEW.risk_level = 'High' THEN
      NEW.level_change_flag := true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER risk_level_change_trigger
BEFORE INSERT OR UPDATE ON public.risk_assessments
FOR EACH ROW
EXECUTE FUNCTION public.check_risk_level_change();

-- Add updated_at trigger for config table
CREATE TRIGGER update_risk_assessment_config_updated_at
BEFORE UPDATE ON public.risk_assessment_config
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();