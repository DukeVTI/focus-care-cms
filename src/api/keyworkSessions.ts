import { supabase } from "@/integrations/supabase/client";
import { KeyworkSessionDetail } from "@/lib/types";

export const fetchKeyworkSessions = async (): Promise<KeyworkSessionDetail[]> => {
  const { data, error } = await supabase
    .from("keywork_sessions")
    .select(`
      *,
      young_people:young_person_id (
        first_name,
        last_name
      )
    `)
    .order("session_date", { ascending: false });

  if (error) throw error;
  return data as unknown as KeyworkSessionDetail[];
};

export const fetchUpcomingSessions = async (limit: number = 3): Promise<KeyworkSessionDetail[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("keywork_sessions")
    .select(`*, young_people:young_person_id (first_name, last_name)`)
    .gte("session_date", today.toISOString())
    .order("session_date", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data as unknown as KeyworkSessionDetail[];
};

export const fetchKeyworkSessionsCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("keywork_sessions")
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
};
