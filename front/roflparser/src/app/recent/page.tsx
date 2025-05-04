"use client";
import Loading from "@/components/loading/Loading";
import MatchCard from "@/components/MatchCard";
import { useMatches } from "@/hooks/rofl";
import { useChampionMap } from "@/hooks/riot/useChampionMap";
import Pagination from "@/components/pagination/Pagination";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam) : 1; // 1-based UI

  const {
    data: matches,
    isLoading,
    error,
  } = useMatches("desc", currentPage - 1); // 0-based API
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
        {matches?.items.map((match) => (
          <MatchCard
            key={match.matchId}
            match={match}
            championMap={championMap}
          />
        ))}
      </div>
      <Pagination
        totalItems={matches!.totalItems}
        currentPage={currentPage}
        pageCount={10}
        itemCountPerPage={10}
      />
    </div>
  );
}
