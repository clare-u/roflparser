import { useQuery } from "@tanstack/react-query";
import { getMatchesByPlayer } from "@/libs";
import { PlayerStatsResponse } from "@/types/rofl"; // 이 타입이 정의되어 있어야 해

export const useMatchesByPlayer = (
  nickname: string,
  tagline?: string,
  sort: "asc" | "desc" = "desc"
) => {
  return useQuery<PlayerStatsResponse[], Error>({
    queryKey: ["matchesByPlayer", nickname, tagline, sort],
    queryFn: () => getMatchesByPlayer(nickname, tagline, sort),
    enabled: !!nickname, // nickname이 있을 때만 실행
    staleTime: 1000 * 60, // 1분 캐시
  });
};
