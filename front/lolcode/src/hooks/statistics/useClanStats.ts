import { useQuery } from "@tanstack/react-query";
import { getClanStatistics } from "@/libs";
import { ClanStatisticsResponse } from "@/types";

export const useClanStats = (month: string) => {
  return useQuery<ClanStatisticsResponse>({
    queryKey: ["clan-stats", month],
    queryFn: () => getClanStatistics(month),
    enabled: !!month,
  });
};
