export type PositionKey = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";

export interface PlayerPositionRequest {
  nickname: string;
  tagLine: string;
  positions: Partial<Record<PositionKey, string | null>>;
}

export interface PlayerPositionResponse {
  nickname: string;
  tagLine: string;
  positions: Partial<Record<PositionKey, string | null>>;
}
