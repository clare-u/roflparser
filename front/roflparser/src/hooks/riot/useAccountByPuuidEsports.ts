import { useQuery } from "@tanstack/react-query";
import { handleRiotApiRequest, RIOT_API_SERVERS } from "@/libs/api/riotApi";

export const useAccountByPuuidEsports = (
  puuid: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["account", "by-puuid-esports", puuid],
    queryFn: () =>
      handleRiotApiRequest(
        `/riot/account/v1/accounts/by-puuid/${puuid}`,
        RIOT_API_SERVERS.REGIONAL
      ),
    enabled,
  });
};
