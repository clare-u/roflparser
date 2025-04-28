import { useQuery } from "@tanstack/react-query";
import { getAllPlayers } from "@/libs/api/rofl";
import { PlayerInfo } from "@/types/rofl";

/**
 * 저장된 전체 플레이어 목록을 불러오는 커스텀 훅
 */
export const useGetAllPlayers = () => {
  return useQuery<PlayerInfo[]>({
    queryKey: ["players", "all"],
    queryFn: getAllPlayers,
    staleTime: 1000 * 60 * 5, // 5분 동안 fresh
    gcTime: 1000 * 60 * 10, // 10분 후 garbage collection
  });
};
