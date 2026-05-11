import { useQuery } from "@tanstack/react-query";
import { fetchTasks, fetchRecentTasks, fetchTasksBase } from "@/api/tasks";

export const useTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });
};

export const useRecentTasks = (limit: number = 4) => {
  return useQuery({
    queryKey: ["tasks", "recent", limit],
    queryFn: () => fetchRecentTasks(limit),
  });
};

export const useTasksBase = () => {
  return useQuery({
    queryKey: ["tasks", "base"],
    queryFn: fetchTasksBase,
  });
};
