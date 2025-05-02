import { useQuery } from "@tanstack/react-query";
import { getPlayerPositions } from "@/libs";
import { PlayerPositionResponse } from "@/types";

/**
 * 특정 닉네임의 포지션별 티어 조회하는 훅 (GET)
 */
export const useGetPlayerPositions = (nickname: string) => {
  return useQuery<PlayerPositionResponse>({
    queryKey: ["playerPositions", nickname],
    queryFn: () => getPlayerPositions(nickname),
    enabled: !!nickname, // nickname이 있을 때만 실행
  });
};
