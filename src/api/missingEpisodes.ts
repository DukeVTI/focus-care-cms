import { supabase } from "@/integrations/supabase/client";
import { MissingEpisodeDetail } from "@/lib/types";

export const fetchMissingEpisodes = async (): Promise<MissingEpisodeDetail[]> => {
  const { data, error } = await supabase
    .from("missing_episodes")
    .select(`
      *,
      young_people:young_person_id (
        first_name,
        last_name,
        focus_id
      )
    `)
    .order("missing_from", { ascending: false });

  if (error) throw error;
  return data as unknown as MissingEpisodeDetail[];
};
