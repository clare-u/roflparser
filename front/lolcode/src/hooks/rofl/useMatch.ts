import { useQuery } from "@tanstack/react-query";
import { getMatchById } from "@/libs";
import { MatchSummary } from "@/types/rofl";

export const useMatch = (matchId: string) => {
  return useQuery<MatchSummary, Error>({
    queryKey: ["match", matchId],
    queryFn: (() => getMatchById(matchId)) as () => Promise<MatchSummary>,
    enabled: !!matchId, // matchId가 있을 때만 실행
    staleTime: 1000 * 60 * 1, // 1분 동안 fresh
  });
};
