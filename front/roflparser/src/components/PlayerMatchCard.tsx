import React from "react";
import { PlayerStatsResponse, SummaryStats } from "@/types/rofl";
import MatchCard from "./MatchCard";
import { useChampionMap, useGetPlayerPositions } from "@/hooks";
import ChampionPortrait from "./ChampionPortrait";
import Image from "next/image";
import Loading from "./loading/Loading";
import { mapPositionLabel } from "@/utils/position";

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
      title === "UTILITY" ? (
        <Image
          src={`/position/${title}.svg`}
          alt={String(title)}
          width={20}
          height={20}
        />
      ) : null}
      <h4 className="font-bold text-gray-700">
        {typeof title === "string" ? mapPositionLabel(title) : title}
      </h4>
    </div>
    <p>
      {stats.matches}전 {stats.wins}승 {stats.losses}패
    </p>
    <p>
      KDA: {stats.avgKills.toFixed(1)} / {stats.avgDeaths.toFixed(1)} /{" "}
      {stats.avgAssists.toFixed(1)} ({stats.kda.toFixed(2)})
    </p>
  </div>
);

const PlayerMatchCard: React.FC<Props> = ({ player }) => {
  const { championMap, loading, error } = useChampionMap();
  const {
    data: playerPositions,
    isLoading: positionLoading,
    error: positionError,
  } = useGetPlayerPositions(player.gameName);

  if (loading || positionLoading) return <Loading />;
  if (error || positionError) return <div>오류 발생: {error}</div>;

  const orderedPositions = [
    "TOP",
    "JUNGLE",
    "MIDDLE",
    "BOTTOM",
    "UTILITY",
  ] as const;
  type PositionKey = (typeof orderedPositions)[number];

  return (
    <div className="border rounded-xl p-6 mb-6 shadow-md bg-gray-50">
      <h2 className="text-3xl font-semibold text-indigo-800 mb-4">
        {player.gameName} #{player.tagLine}
      </h2>

      {/* 총 전적 */}
      <SummaryBox title="총 전적" stats={player.summary} />

      {/* 라인별 내전 티어 */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">
          라인별 내전 티어
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 border rounded-xl ">
          {orderedPositions.map((position: PositionKey) => (
            <div key={position} className="p-4 flex items-center gap-2">
              <Image
                src={`/position/${position}.svg`}
                alt={mapPositionLabel(position)}
                width={20}
                height={20}
              />
              <h4 className="font-bold text-gray-700">
                {mapPositionLabel(position)}
              </h4>
              <span className="">
                {playerPositions?.positions?.[position] ?? "미정"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 라인별 전적 */}
      <div className="mt-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">
          라인별 전적
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(player.byPosition)
            .sort(
              ([a], [b]) =>
                orderedPositions.indexOf(a as PositionKey) -
                orderedPositions.indexOf(b as PositionKey)
            )
            .map(([position, stats]) => (
              <SummaryBox key={position} title={position} stats={stats} />
            ))}
        </div>
      </div>

      {/* 챔피언별 전적 */}
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

      {/* 참여 경기 */}
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
