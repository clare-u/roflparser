"use client";

import Loading from "@/components/loading/Loading";
import MatchCard from "@/components/MatchCard";
import { useMatch } from "@/hooks/rofl";
import { useChampionMap } from "@/hooks/riot/useChampionMap";
import { useParams } from "next/navigation";

export default function SearchPage() {
  const { matchId } = useParams() as { matchId: string };
  const { data: match, isLoading, error } = useMatch(matchId);
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

  if (error || champError || !match)
    return (
      <div>
        에러 발생:{" "}
        {(error?.message || champError?.toString()) ?? "데이터가 없습니다."}
      </div>
    );

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-[20px] py-[40px]">
      <div>
        <MatchCard match={match} championMap={championMap} />
      </div>
    </div>
  );
}
