import { handleApiRequest } from "@/libs/api/client";
import { PlayerPositionRequest, PlayerPositionResponse } from "@/types";

/**
 * 포지션별 티어 등록
 */
export const createPlayerPositions = async (data: PlayerPositionRequest) => {
  return handleApiRequest<{ message: string }, "post", PlayerPositionRequest>(
    "/api/players/positions",
    "post",
    data
  );
};

/**
 * 포지션별 티어 조회
 */
export const getPlayerPositions = async (nickname: string) => {
  return handleApiRequest<PlayerPositionResponse, "get">(
    `/api/players/${encodeURIComponent(nickname)}/positions`,
    "get"
  );
};

/**
 * 포지션별 티어 수정
 */
export const updatePlayerPositions = async (
  nickname: string,
  data: PlayerPositionRequest
) => {
  return handleApiRequest<{ message: string }, "put", PlayerPositionRequest>(
    `/api/players/${encodeURIComponent(nickname)}/positions`,
    "put",
    data
  );
};
