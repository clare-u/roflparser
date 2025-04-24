import { useQuery } from "@tanstack/react-query";
import { handleRiotApiRequest, RIOT_API_SERVERS } from "@/libs/api/riotApi";

export const useActiveShardByGame = (
  game: string,
  puuid: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["active-shards", game, puuid],
    queryFn: () =>
      handleRiotApiRequest(
        `/riot/account/v1/active-shards/by-game/${game}/by-puuid/${puuid}`,
        RIOT_API_SERVERS.REGIONAL
      ),
    enabled,
  });
};
