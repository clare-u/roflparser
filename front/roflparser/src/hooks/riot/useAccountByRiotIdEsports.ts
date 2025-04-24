import { useQuery } from "@tanstack/react-query";
import { handleRiotApiRequest, RIOT_API_SERVERS } from "@/libs/api/riotApi";

export const useAccountByRiotIdEsports = (
  gameName: string,
  tagLine: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["account", "by-riot-id-esports", gameName, tagLine],
    queryFn: () =>
      handleRiotApiRequest(
        `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
        RIOT_API_SERVERS.REGIONAL
      ),
    enabled,
  });
};
