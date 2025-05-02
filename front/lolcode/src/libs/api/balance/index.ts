import { handleApiRequest } from "../client";
import { BalanceScores } from "@/types";

// 티어-포지션별 기본 점수 전체 조회 API
export const getBalanceScores = async () => {
  return handleApiRequest<BalanceScores, "get">("/api/balance/scores", "get");
};
