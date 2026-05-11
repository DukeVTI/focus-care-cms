import { useQuery } from "@tanstack/react-query";
import { fetchMissingEpisodes } from "@/api/missingEpisodes";

export const useMissingEpisodes = () => {
  return useQuery({
    queryKey: ["missing_episodes"],
    queryFn: fetchMissingEpisodes,
  });
};
