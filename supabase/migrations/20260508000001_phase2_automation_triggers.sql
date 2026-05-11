-- ============================================================================
-- AUTOMATION TRIGGERS FOR PHASE 2
-- 1. Missing Episode Return -> Mandatory Risk Assessment Task
-- 2. Health Crisis (Level 5) -> Urgent Risk Assessment Task
-- ============================================================================

-- Function to handle missing episode return
CREATE OR REPLACE FUNCTION public.handle_missing_episode_return()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assigned_user_id UUID;
BEGIN
  -- Check if status changed from missing to returned
  IF NEW.status = 'returned' AND OLD.status = 'missing' THEN
    
    -- Get the user_id (keyworker/owner) of the young person
    SELECT user_id INTO v_assigned_user_id
    FROM public.young_people
    WHERE id = NEW.young_person_id;
    
    IF v_assigned_user_id IS NOT NULL THEN
      -- Insert a mandatory risk assessment task
      INSERT INTO public.tasks (
        young_person_id,
        assigned_to,
        title,
        description,
        importance,
        requires_support,
        status,
        due_date
      ) VALUES (
        NEW.young_person_id,
        v_assigned_user_id,
        'URGENT: Risk Assessment Update (Missing Episode Return)',
        'Young person returned from missing episode ' || COALESCE(NEW.case_id, '') || '. Statutory guidelines require Risk Assessment update within 24 hours.',
        'High',
        'Yes',
        'pending',
        CURRENT_DATE + INTERVAL '1 day'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for missing episode return
DROP TRIGGER IF EXISTS on_missing_episode_returned ON public.missing_episodes;
CREATE TRIGGER on_missing_episode_returned
  AFTER UPDATE OF status ON public.missing_episodes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_missing_episode_return();

-- Function to handle health crisis
CREATE OR REPLACE FUNCTION public.handle_health_crisis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assigned_user_id UUID;
BEGIN
  -- Check if rating is 5 (Crisis)
  IF NEW.rating = 5 THEN
    
    -- Get the user_id (keyworker/owner) of the young person
    SELECT user_id INTO v_assigned_user_id
    FROM public.young_people
    WHERE id = NEW.young_person_id;
    
    IF v_assigned_user_id IS NOT NULL THEN
      -- Insert a mandatory risk assessment task
      INSERT INTO public.tasks (
        young_person_id,
        assigned_to,
        title,
        description,
        importance,
        requires_support,
        status,
        due_date
      ) VALUES (
        NEW.young_person_id,
        v_assigned_user_id,
        'URGENT: Risk Assessment Review (Health Crisis)',
        'A level 5 health crisis was recorded for ' || NEW.category || ' - ' || NEW.condition_name || '. Please review and update the Risk Assessment immediately.',
        'High',
        'Yes',
        'pending',
        CURRENT_DATE
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for health crisis insert/update
DROP TRIGGER IF EXISTS on_health_crisis_recorded ON public.health_condition_entries;
CREATE TRIGGER on_health_crisis_recorded
  AFTER INSERT OR UPDATE OF rating ON public.health_condition_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_health_crisis();
