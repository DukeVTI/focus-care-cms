import { supabase } from "@/integrations/supabase/client";
import { YoungPerson } from "@/lib/types";

export const fetchYoungPeople = async (): Promise<YoungPerson[]> => {
  const { data, error } = await supabase
    .from("young_people")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as YoungPerson[];
};

export const fetchRecentYoungPeople = async (limit: number = 4): Promise<YoungPerson[]> => {
  const { data, error } = await supabase
    .from("young_people")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as YoungPerson[];
};

export const fetchYoungPeopleCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("young_people")
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
};
