import { PlayerSummary } from "@/types/rofl";

// 포지션 순서 정의
const POSITION_ORDER = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];

const sortPlayersByPosition = (players: PlayerSummary[]) => {
  return [...players].sort(
    (a, b) =>
      POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position)
  );
};

export const groupByTeam = (players: PlayerSummary[]) => {
  const team100 = players.filter((p) => p.team === "100");
  const team200 = players.filter((p) => p.team === "200");

  return {
    team100: sortPlayersByPosition(team100),
    team200: sortPlayersByPosition(team200),
  };
};
