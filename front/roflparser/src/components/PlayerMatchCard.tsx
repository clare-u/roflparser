import React from "react";
import { PlayerStatsResponse, SummaryStats } from "@/types/rofl";
import MatchCard from "./MatchCard";

interface Props {
  player: PlayerStatsResponse;
}

const SummaryBox = ({
  title,
  stats,
}: {
  title: string;
  stats: SummaryStats;
}) => (
  <div className="p-4 border rounded-lg bg-white shadow">
    <h4 className="font-bold mb-2 text-gray-700">{title}</h4>
    <p>
      전적: {stats.matches}전 {stats.wins}승 {stats.losses}패
    </p>
    <p>
      KDA: {stats.kills}/{stats.deaths}/{stats.assists} ({stats.kda.toFixed(2)})
    </p>
  </div>
);

const PlayerMatchCard: React.FC<Props> = ({ player }) => {
  return (
    <div className="border rounded-xl p-6 mb-6 shadow-md bg-gray-50">
      <h2 className="text-xl font-semibold text-indigo-800 mb-4">
        {player.gameName}#{player.tagLine}
      </h2>

      <SummaryBox title="총 전적" stats={player.summary} />

      <div className="mt-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">
          라인별 전적
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(player.byPosition).map(([position, stats]) => (
            <SummaryBox key={position} title={position} stats={stats} />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">
          챔피언별 전적
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(player.byChampion).map(([champion, stats]) => (
            <SummaryBox key={champion} title={champion} stats={stats} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-3 text-gray-800">참여 경기</h3>
        {player.matches.map((matchInfo, idx) => (
          <div key={idx}>
            <MatchCard match={matchInfo.match} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerMatchCard;
