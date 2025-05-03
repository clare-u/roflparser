// 챔피언 통계 응답
export interface ChampionStatisticsResponse {
  popularChampions: ChampionStatDto[];
  tier1Champions: ChampionScoreDto[];
  tier5Champions: ChampionScoreDto[];
}

export interface ChampionStatDto {
  name: string; // 챔피언 영어 이름 (예: "Ahri")
  matches: number;
  wins: number;
  losses: number;
  winRate: number; // % 단위 (예: 61.5)
}

export interface ChampionScoreDto extends ChampionStatDto {
  pickRate: number; // % 단위
  score: number; // 승률/픽률 기반 계산 점수
}

// 플레이어 통계 응답
export interface PlayerStatisticsResponse {
  topByMatches: PlayerMatchCountDto[];
  topByWinRate: PlayerWinRateDto[];
  tier1Champions: ChampionScoreDto[];
  tier5Champions: ChampionScoreDto[];
}

export interface PlayerMatchCountDto {
  gameName: string;
  matches: number;
}

export interface PlayerWinRateDto {
  gameName: string;
  wins: number;
  winRate: number; // % 단위
  kda: number; // 평균 KDA
}

// 클랜 전체 전적 응답
export interface ClanStatisticsResponse {
  players: ClanPlayerDto[];
}

export interface ClanPlayerDto {
  gameName: string;
  matches: number;
}
