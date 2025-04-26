import { useQuery } from "@tanstack/react-query";
import { getBalanceScores } from "@/libs/api/balance";
import { BalanceScores } from "@/types";

/**
 * 전체 티어-포지션별 점수를 가져오는 훅
 */
export const useBalanceScores = () => {
  return useQuery<BalanceScores>({
    queryKey: ["balance-scores"],
    queryFn: getBalanceScores,
    staleTime: 1000 * 60 * 5, // 5분 동안 fresh
  });
};
