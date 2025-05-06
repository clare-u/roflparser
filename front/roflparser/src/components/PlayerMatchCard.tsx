"use client";

import { useState } from "react";
import { PlayerStatsResponse, SummaryStats } from "@/types";
import MatchCard from "./MatchCard";
import { useChampionMap } from "@/hooks";
import ChampionPortrait from "./ChampionPortrait";
import Image from "next/image";
import Loading from "./loading/Loading";
import { mapPositionLabel } from "@/utils/position";
import Pagination from "@/components/pagination/Pagination";
import FilterDropdown from "./input/FilterDropdown";

interface FilterOption {
  label: string;
  value: "desc" | "asc";
}

interface Props {
  player: PlayerStatsResponse;
  currentPage: number;
  selectedLabel: string;
  filterOptions: FilterOption[];
  setSelectedFilter: (value: "desc" | "asc") => void;
  updateURL: (sort: "desc" | "asc") => void;
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
      {stats.matches}전 {stats.wins}승 {stats.losses}패 (
      {stats.winRate.toFixed(2)}%)
    </p>
    <p>
      KDA: {stats.avgKills.toFixed(1)} / {stats.avgDeaths.toFixed(1)} /{" "}
      {stats.avgAssists.toFixed(1)} ({stats.kda.toFixed(2)})
    </p>
  </div>
);

const PlayerMatchCard: React.FC<Props> = ({
  player,
  currentPage,
  selectedLabel,
  filterOptions,
  setSelectedFilter,
  updateURL,
}) => {
  // 챔피언별 전적 토글
  const [showAllChampions, setShowAllChampions] = useState(false);

  const { championMap, loading, error } = useChampionMap();

  if (loading) return <Loading />;
  if (error) return <div>오류 발생: {error}</div>;

  const orderedPositions = [
    "TOP",
    "JUNGLE",
    "MIDDLE",
    "BOTTOM",
    "UTILITY",
  ] as const;
  type PositionKey = (typeof orderedPositions)[number];

  // 챔피언별 전적 최대 6개만 보여주기
  const visibleChampionStats = showAllChampions
    ? player.byChampion
    : player.byChampion.slice(0, 6);

  return (
    <div className="border rounded-xl p-6 mb-6 shadow-md bg-gray-50">
      <h2 className="text-3xl font-semibold text-indigo-800 mb-4">
        {player.gameName} #{player.tagLine}
      </h2>

      {/* 총 전적 */}
      <SummaryBox title="총 전적" stats={player.summary} />

      {/* 라인별 전적 */}
      <div className="mt-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">
          라인별 전적
        </h3>
        <div className="grid grid-cols-1  tablet:grid-cols-2 desktop:grid-cols-3 gap-3">
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
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-3">
          {visibleChampionStats.map((stats) => (
            <SummaryBox
              key={stats.champion}
              title={
                <div className="flex items-center gap-2">
                  <ChampionPortrait
                    championId={stats.champion}
                    nameMap={championMap}
                  />
                  <span>{championMap[stats.champion] || stats.champion}</span>
                </div>
              }
              stats={stats}
            />
          ))}
        </div>
        {player.byChampion.length > 6 && (
          <div className="mt-2 text-right">
            <button
              onClick={() => setShowAllChampions(!showAllChampions)}
              className="hover:underline text-[16px]"
            >
              {showAllChampions ? "접기 ▲" : "펼쳐보기 ▼"}
            </button>
          </div>
        )}
      </div>

      {/* 참여 경기 */}
      <div className="mt-6">
        <div className="flex justify-between">
          <h3 className="font-semibold text-lg text-gray-800 text-nowrap">
            참여 경기
          </h3>
          {/* 필터 */}
          <div className="flex w-full justify-end mb-[20px]">
            <FilterDropdown
              selectedFilter={selectedLabel}
              onSelectFilter={(label) => {
                const selected = filterOptions.find(
                  (opt) => opt.label === label
                );
                if (selected) {
                  setSelectedFilter(selected.value as "desc" | "asc");
                  updateURL(selected.value as "desc" | "asc");
                }
              }}
              filterOptions={filterOptions.map((opt) => opt.label)}
            />
          </div>
        </div>
        {player.matches.map((matchInfo, idx) => (
          <MatchCard
            key={idx}
            match={matchInfo.match}
            win={matchInfo.win}
            championMap={championMap}
          />
        ))}
        <Pagination
          totalItems={player.totalItems}
          currentPage={currentPage}
          pageCount={10}
          itemCountPerPage={10}
        />
      </div>
    </div>
  );
};

export default PlayerMatchCard;
