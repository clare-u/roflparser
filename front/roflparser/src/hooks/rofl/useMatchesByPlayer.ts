import { useQuery } from "@tanstack/react-query";
import { getMatchesByPlayer } from "@/libs";
import { MatchSummary } from "@/types/rofl";

export const useMatchesByPlayer = (
  nickname: string,
  tagline?: string,
  sort: "asc" | "desc" = "desc"
) => {
  return useQuery<MatchSummary[], Error>({
    queryKey: ["matchesByPlayer", nickname, tagline, sort],
    queryFn: () =>
      getMatchesByPlayer(nickname, tagline, sort) as Promise<MatchSummary[]>,
    enabled: !!nickname, // nickname이 있을 때만 실행
    staleTime: 1000 * 60, // 1분 캐시
  });
};
