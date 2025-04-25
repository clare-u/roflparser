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
  matches: MatchResult[]; // or MatchSummary[] depending on what you return
}
