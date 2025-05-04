import { useQuery } from "@tanstack/react-query";
import { getMatchesByPlayer } from "@/libs";
import { PlayerStatsResponse } from "@/types";

export const useMatchesByPlayer = (
  nickname: string,
  tagline: string | undefined,
  sort: "asc" | "desc",
  page: number,
  size: number = 10
) => {
  return useQuery<PlayerStatsResponse, Error>({
    queryKey: ["matchesByPlayer", nickname, page, tagline, sort, size],
    queryFn: () => getMatchesByPlayer(nickname, page, tagline, sort, size),
    enabled: !!nickname,
    staleTime: 1000 * 60, // 1분 캐시
  });
};
