import React from "react";
import { MatchSummary } from "@/types/rofl";
import { groupByTeam } from "@/utils/teamsort";

interface MatchCardProps {
  match: MatchSummary;
}

const formatGameLength = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { team100, team200 } = groupByTeam(match.players);

  const team100Win = team100[0]?.win ?? false;
  const team200Win = team200[0]?.win ?? false;

  return (
    <div className="border rounded-xl p-4 mb-4 shadow-lg">
      <div className="text-sm text-gray-600 mb-2">
        {new Date(match.gameDatetime).toLocaleString()} / ⏱
        {formatGameLength(match.gameLength)} / Match ID: {match.matchId}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Team 100 */}
        <div>
          <h3
            className={`font-bold mb-2 ${
              team100Win ? "text-blue-600" : "text-gray-500"
            }`}
          >
            블루팀 - {team100Win ? "승리" : "패배"}
          </h3>
          <ul>
            {team100.map((player) => (
              <li key={player.riotIdGameName} className="mb-1">
                [{player.position}] {player.champion} - {player.riotIdGameName}{" "}
                #{player.riotIdTagLine} ({player.kills}/{player.deaths}/
                {player.assists})
              </li>
            ))}
          </ul>
        </div>

        {/* Team 200 */}
        <div>
          <h3
            className={`font-bold mb-2 ${
              team200Win ? "text-blue-600" : "text-gray-500"
            }`}
          >
            레드팀 - {team200Win ? "승리" : "패배"}
          </h3>
          <ul>
            {team200.map((player) => (
              <li key={player.riotIdGameName} className="mb-1">
                [{player.position}] {player.champion} - {player.riotIdGameName}{" "}
                #{player.riotIdTagLine} ({player.kills}/{player.deaths}/
                {player.assists})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
