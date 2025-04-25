import { useQuery } from "@tanstack/react-query";
import { getMatchByMatchId } from "@/libs";

export const useMatchById = (matchId: string, enabled = true) => {
  return useQuery({
    queryKey: ["match", matchId],
    queryFn: () => getMatchByMatchId(matchId),
    enabled: !!matchId && enabled,
    staleTime: 1000 * 60 * 5,
  });
};
