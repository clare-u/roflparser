"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useChampionStats, usePlayerStats, useChampionMap } from "@/hooks";
import Loading from "@/components/loading/Loading";
import { useMemo } from "react";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthOptions = () => {
  const start = new Date(2025, 3); // 2025-04 (4월은 3으로 지정)
  const now = new Date();
  const months: string[] = [];

  const d = new Date(now.getFullYear(), now.getMonth(), 1);
  while (d >= start) {
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(m);
    d.setMonth(d.getMonth() - 1);
  }

  return months;
};

export default function StatisticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const month = searchParams.get("month") || getCurrentMonth();

  const monthOptions = useMemo(() => getMonthOptions(), []);

  const { data: champData, isLoading: champLoading } = useChampionStats(month);
  const { data: playerData, isLoading: playerLoading } = usePlayerStats(month);
  const { championMap, loading: champNameLoading } = useChampionMap();

  const getKoreanName = (eng: string) => championMap[eng] || eng;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = e.target.value;
    router.push(`?month=${selectedMonth}`);
  };

  console.log(champData);

  return (
    <div className="px-[10px] desktop:px-[40px] py-[20px] desktop:py-[60px] max-w-[1200px] w-[100%]">
      <div className="py-[20px] flex flex-col tablet:flex-row tablet:justify-between">
        <div className="text-3xl font-bold mb-4">📊 월별 통계</div>

        <div className="mb-6">
          <label className="mr-2 font-medium text-xl">📅 월 선택:</label>
          <select value={month} onChange={handleChange} className="border p-1">
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 챔피언 통계 */}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">🥇 챔피언 통계</h2>
        {champLoading || champNameLoading ? (
          <Loading />
        ) : (
          <>
            <div className="grid desktop:grid-cols-3 p-[10px] gap-[15px]">
              <div>
                <h3 className="font-medium">🔥 인기 챔피언</h3>
                <ul>
                  {champData?.popularChampions.map((c, i) => (
                    <li key={c.name}>
                      {i + 1}. {getKoreanName(c.name)} - {c.matches}전 {c.wins}
                      승 {c.losses}패 ({c.winRate.toFixed(1)}%)
                    </li>
                  ))}
                </ul>
              </div>
              <div className="">
                <h3 className="font-medium">🏆 1티어</h3>
                <ul>
                  {champData?.tier1Champions.map((c, i) => (
                    <li key={c.name}>
                      {i + 1}. {getKoreanName(c.name)} - {c.matches}전 {c.wins}
                      승 {c.losses}패 ({c.winRate.toFixed(1)}%)
                    </li>
                  ))}
                </ul>
              </div>
              <div className="">
                <h3 className="font-medium">😥 5티어</h3>
                <ul>
                  {champData?.tier5Champions.map((c, i) => (
                    <li key={c.name}>
                      {i + 1}. {getKoreanName(c.name)} - {c.matches}전 {c.wins}
                      승 {c.losses}패 ({c.winRate.toFixed(1)}%)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 플레이어 통계 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">😀 플레이어 통계</h2>
        {playerLoading ? (
          <Loading />
        ) : (
          <>
            <div className="grid desktop:grid-cols-2 p-[10px] gap-[15px]">
              <div>
                <p className="font-medium">🎮 판수 Top 20</p>
                <ul>
                  {playerData?.topByMatches.map((p, i) => (
                    <li key={p.gameName}>
                      {i + 1}. {p.gameName} - {p.matches}전
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">🏆 승률 Top 20</p>
                <ul>
                  {playerData?.topByWinRate.map((p, i) => (
                    <li key={p.gameName}>
                      {i + 1}. {p.gameName} - {p.wins}승 ({p.winRate.toFixed(1)}
                      %) KDA {p.kda.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
