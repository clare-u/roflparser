import { useQuery } from "@tanstack/react-query";
import { getMatchById } from "@/libs";

export const useMatchById = (matchId: string, enabled = true) => {
  return useQuery({
    queryKey: ["match", matchId],
    queryFn: () => getMatchById(matchId),
    enabled: !!matchId && enabled,
    staleTime: 1000 * 60 * 5,
  });
};
