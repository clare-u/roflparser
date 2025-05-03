import { handleApiRequest } from "../client";
import {
  ChampionStatisticsResponse,
  PlayerStatisticsResponse,
  ClanStatisticsResponse,
} from "@/types";

// 챔피언 통계 조회 API
export const getChampionStatistics = async (month: string) => {
  return handleApiRequest<ChampionStatisticsResponse, "get">(
    `/api/statistics/champion?month=${month}`,
    "get"
  );
};

// 플레이어 통계 조회 API
export const getPlayerStatistics = async (month: string) => {
  return handleApiRequest<PlayerStatisticsResponse, "get">(
    `/api/statistics/player?month=${month}`,
    "get"
  );
};

// 클랜 통계 조회 API
export const getClanStatistics = async (month: string) => {
  return handleApiRequest<ClanStatisticsResponse, "get">(
    `/api/statistics/clan?month=${month}`,
    "get"
  );
};
