import { useQuery } from "@tanstack/react-query";
import { getPlayerStatistics } from "@/libs/api";
import { PlayerStatisticsResponse } from "@/types";

export const usePlayerStats = (month: string) => {
  return useQuery<PlayerStatisticsResponse>({
    queryKey: ["player-stats", month],
    queryFn: () => getPlayerStatistics(month),
    enabled: !!month,
  });
};
