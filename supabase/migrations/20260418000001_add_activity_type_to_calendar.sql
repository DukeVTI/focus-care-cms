-- Add activity_type column to calendar_events table
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS activity_type TEXT DEFAULT 'other';

-- Add meeting_type column for standardized meeting categorization
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS meeting_type TEXT;

-- Create an index on activity_type for reporting performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_activity_type 
ON public.calendar_events(activity_type);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_calendar_events_status 
ON public.calendar_events(status);
