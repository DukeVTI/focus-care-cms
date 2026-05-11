import { useQuery } from "@tanstack/react-query";
import { fetchYoungPeople, fetchRecentYoungPeople, fetchYoungPeopleCount } from "@/api/youngPeople";

export const useYoungPeople = () => {
  return useQuery({
    queryKey: ["young_people"],
    queryFn: fetchYoungPeople,
  });
};

export const useRecentYoungPeople = (limit: number = 4) => {
  return useQuery({
    queryKey: ["young_people", "recent", limit],
    queryFn: () => fetchRecentYoungPeople(limit),
  });
};

export const useYoungPeopleCount = () => {
  return useQuery({
    queryKey: ["young_people", "count"],
    queryFn: fetchYoungPeopleCount,
  });
};
