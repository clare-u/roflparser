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
