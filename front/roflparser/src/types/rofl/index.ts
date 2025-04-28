export interface PlayerSummary {
  riotIdGameName: string;
  riotIdTagLine: string;
  champion: string;
  team: string;
  position: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
}

export interface MatchSummary {
  matchId: string;
  gameDatetime: string;
  gameLength: number;
  players: PlayerSummary[];
}

export interface PlayerInfo {
  riotIdGameName: string;
  riotIdTagLine: string;
}

export interface SummaryStats {
  matches: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  winRate: number; // 승률 (ex: 66.66)

  // 평균 킬/데스/어시 (double)
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
}

export interface MatchResult {
  matchId: string;
  win: boolean;
}

export interface PlayerStatsResponse {
  gameName: string;
  tagLine: string;
  summary: SummaryStats;
  byChampion: Record<string, SummaryStats>;
  byPosition: Record<string, SummaryStats>;
  matches: PlayerMatchInfo[];
}

export interface PlayerMatchInfo {
  match: MatchSummary; // 전체 경기 정보
  win: boolean; // 해당 플레이어 기준 승리 여부
}

export enum Position {
  TOP = "TOP",
  JUNGLE = "JUNGLE",
  MIDDLE = "MIDDLE",
  BOTTOM = "BOTTOM",
  UTILITY = "UTILITY",
}
