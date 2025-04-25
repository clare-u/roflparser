import React from "react";
import { PlayerStatsResponse, SummaryStats } from "@/types/rofl";
import MatchCard from "./MatchCard";
import { useChampionMap } from "@/hooks/riot/useChampionMap";
import ChampionPortrait from "./ChampionPortrait";
import Image from "next/image";

interface Props {
  player: PlayerStatsResponse;
}

const SummaryBox = ({
  title,
  stats,
}: {
  title: React.ReactNode;
  stats: SummaryStats;
}) => (
  <div className="p-4 border rounded-lg bg-white shadow">
    <div className="flex items-center gap-2">
      {(typeof title === "string" && title === "TOP") ||
      title === "JUNGLE" ||
      title === "MIDDLE" ||
      title === "BOTTOM" ||
      title === "UTLITY" ? (
        <Image
          src={`/position/${title}.svg`}
          alt={String(title)}
          width={15}
          height={15}
        />
      ) : null}
      <h4 className="font-bold text-gray-700">{title}</h4>
    </div>
    <p>
      전적: {stats.matches}전 {stats.wins}승 {stats.losses}패
    </p>
    <p>
      KDA: {stats.kills}/{stats.deaths}/{stats.assists} ({stats.kda.toFixed(2)})
    </p>
  </div>
);

const PlayerMatchCard: React.FC<Props> = ({ player }) => {
  const { championMap, loading, error } = useChampionMap();

  if (loading) return <div>챔피언 데이터를 불러오는 중입니다...</div>;
  if (error) return <div>오류 발생: {error}</div>;

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
            <SummaryBox
              key={champion}
              title={
                <div className="flex items-center gap-2">
                  <ChampionPortrait
                    championId={champion}
                    nameMap={championMap}
                  />
                  <span>{championMap[champion] || champion}</span>
                </div>
              }
              stats={stats}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-3 text-gray-800">참여 경기</h3>
        {player.matches.map((matchInfo, idx) => (
          <MatchCard
            key={idx}
            match={matchInfo.match}
            win={matchInfo.win}
            championMap={championMap}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerMatchCard;
