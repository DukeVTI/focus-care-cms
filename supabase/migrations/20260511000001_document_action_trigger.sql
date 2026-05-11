-- ============================================================================
-- AUTOMATION TRIGGER FOR DOCUMENTS
-- Document marked as Action Required -> Generates Task for Keyworker
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_document_action_required()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assigned_user_id UUID;
BEGIN
  -- Check if action_required became true (on insert or update)
  IF NEW.action_required = true AND (TG_OP = 'INSERT' OR OLD.action_required = false) THEN
    
    -- Get the user_id (keyworker/owner) of the young person
    SELECT user_id INTO v_assigned_user_id
    FROM public.young_people
    WHERE id = NEW.young_person_id;
    
    IF v_assigned_user_id IS NOT NULL THEN
      -- Insert a task assigned to the keyworker
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
        'Action Required: Document ' || NEW.file_name,
        COALESCE(NEW.action_notes, 'A document requires your attention. Category: ' || NEW.category),
        'Medium',
        'No',
        'pending',
        CURRENT_DATE + INTERVAL '3 days'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for document action_required update or insert
DROP TRIGGER IF EXISTS on_document_action_required ON public.young_person_documents;
CREATE TRIGGER on_document_action_required
  AFTER INSERT OR UPDATE OF action_required ON public.young_person_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_document_action_required();
