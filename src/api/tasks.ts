import { supabase } from "@/integrations/supabase/client";
import { TaskWithYoungPerson, Task } from "@/lib/types";

export const fetchTasks = async (): Promise<TaskWithYoungPerson[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      young_people:young_person_id (
        first_name,
        last_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as TaskWithYoungPerson[];
};

export const fetchRecentTasks = async (limit: number = 4): Promise<TaskWithYoungPerson[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select(`*, young_people:young_person_id (first_name, last_name)`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as unknown as TaskWithYoungPerson[];
};

export const fetchTasksBase = async (): Promise<Task[]> => {
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) throw error;
  return data as unknown as Task[];
};
