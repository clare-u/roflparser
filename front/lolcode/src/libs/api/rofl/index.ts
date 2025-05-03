import { handleApiRequest } from "../client";
import { MatchSummary, PlayerInfo, PlayerStatsResponse } from "@/types";

export const uploadRoflFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  return handleApiRequest<string, "post", FormData>(
    "/api/rofl/upload",
    "post",
    formData
  );
};

// 저장된 모든 경기 정보를 조회하는 API (정렬 순서: asc 또는 desc, 기본은 desc)
export const getMatches = async (sort: "asc" | "desc" = "desc") => {
  return handleApiRequest<MatchSummary[], "get">(
    `/api/matches?sort=${sort}`,
    "get"
  );
};

// 개별 matchId로 경기 상세 정보 조회
export const getMatchById = async (matchId: string) => {
  return handleApiRequest<MatchSummary, "get">(
    `/api/matches/${matchId}`,
    "get"
  );
};

// 특정 플레이어의 전적을 닉네임/태그라인으로 검색
export const getMatchesByPlayer = async (
  nickname: string,
  tagline?: string,
  sort: "asc" | "desc" = "desc"
) => {
  const query = new URLSearchParams({ nickname, sort });
  if (tagline) query.append("tagline", tagline);

  return handleApiRequest<PlayerStatsResponse[], "get">(
    `/api/matches/player?${query.toString()}`,
    "get"
  );
};

// 특정 닉네임을 가진 플레이어들의 태그라인 목록 조회
export const getPlayersByNickname = async (nickname: string) => {
  return handleApiRequest<PlayerInfo[], "get">(
    `/api/players?nickname=${encodeURIComponent(nickname)}`,
    "get"
  );
};

/**
 * 저장된 모든 플레이어 목록 조회하는 API
 * - nickname 없이 전체 조회
 */
export const getAllPlayers = async () => {
  return handleApiRequest<PlayerInfo[], "get">(`/api/players`, "get");
};
