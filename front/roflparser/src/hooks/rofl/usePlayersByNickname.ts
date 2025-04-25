import { useQuery } from "@tanstack/react-query";
import { getPlayersByNickname } from "@/libs";
import { PlayerInfo } from "@/types/rofl";

export const usePlayersByNickname = (nickname: string) => {
  return useQuery<PlayerInfo[], Error>({
    queryKey: ["playersByNickname", nickname],
    queryFn: () => getPlayersByNickname(nickname),
    enabled: !!nickname,
    staleTime: 1000 * 60,
  });
};
