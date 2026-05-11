import { useQuery } from "@tanstack/react-query";
import { fetchKeyworkSessions, fetchUpcomingSessions, fetchKeyworkSessionsCount } from "@/api/keyworkSessions";

export const useKeyworkSessions = () => {
  return useQuery({
    queryKey: ["keywork_sessions"],
    queryFn: fetchKeyworkSessions,
  });
};

export const useUpcomingSessions = (limit: number = 3) => {
  return useQuery({
    queryKey: ["keywork_sessions", "upcoming", limit],
    queryFn: () => fetchUpcomingSessions(limit),
  });
};

export const useKeyworkSessionsCount = () => {
  return useQuery({
    queryKey: ["keywork_sessions", "count"],
    queryFn: fetchKeyworkSessionsCount,
  });
};
