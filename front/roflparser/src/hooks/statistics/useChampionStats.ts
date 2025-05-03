import { useQuery } from "@tanstack/react-query";
import { getChampionStatistics } from "@/libs";
import { ChampionStatisticsResponse } from "@/types";

export const useChampionStats = (month: string) => {
  return useQuery<ChampionStatisticsResponse>({
    queryKey: ["champion-stats", month],
    queryFn: () => getChampionStatistics(month),
    enabled: !!month,
  });
};
