"use client";
import Loading from "@/components/loading/Loading";
import MatchCard from "@/components/MatchCard";
import { useMatches } from "@/hooks/rofl";
import { useChampionMap } from "@/hooks/riot/useChampionMap";

export default function SearchPage() {
  const { data: matches, isLoading, error } = useMatches("desc");
  const {
    championMap,
    loading: champLoading,
    error: champError,
  } = useChampionMap();

  if (
    isLoading ||
    champLoading ||
    !championMap ||
    Object.keys(championMap).length === 0
  )
    return (
      <div className="flex w-full max-w-[1200px] flex-col gap-[20px] py-[20px]">
        <Loading />
      </div>
    );

  if (error || champError) return <div>에러 발생: {error?.message}</div>;

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-[20px] py-[20px]">
      <div>
        {matches?.map((match) => (
          <MatchCard
            key={match.matchId}
            match={match}
            championMap={championMap}
          />
        ))}
      </div>
    </div>
  );
}
