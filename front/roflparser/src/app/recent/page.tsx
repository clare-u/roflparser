"use client";
import { useState } from "react";
import Loading from "@/components/loading/Loading";
import MatchCard from "@/components/MatchCard";
import { useMatches } from "@/hooks/rofl";
import { useChampionMap } from "@/hooks/riot/useChampionMap";
import Pagination from "@/components/pagination/Pagination";
import { useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "@/components/input/FilterDropdown";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam) : 1; // 1-based UI

  // 필터
  const filterOptions = [
    { label: "최신순", value: "desc" },
    { label: "오래된순", value: "asc" },
  ];
  const currentOrder = (searchParams.get("sort") as "desc" | "asc") || "desc";
  const [selectedFilter, setSelectedFilter] = useState<"desc" | "asc">(
    currentOrder
  );

  const {
    data: matches,
    isLoading,
    error,
  } = useMatches(selectedFilter, currentPage - 1); // 0-based API
  const {
    championMap,
    loading: champLoading,
    error: champError,
  } = useChampionMap();

  // URL 업데이트 함수
  const updateURL = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // 정렬 필터 적용
    params.set("sort", newSort);

    // 페이지를 1로 초기화 (필터 바뀌면 처음 페이지부터 보도록)
    params.set("page", "1");

    router.replace(`?${params.toString()}`);
  };

  const selectedLabel =
    filterOptions.find((opt) => opt.value === selectedFilter)?.label || "";

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
    <div className="flex w-full max-w-[1200px] flex-col gap-[20px] px-[5px] desktop:px-[40px] py-[20px]">
      <div>
        {/* 필터 */}
        <div className="flex w-full justify-end py-[20px]">
          <FilterDropdown
            selectedFilter={selectedLabel}
            onSelectFilter={(label) => {
              const selected = filterOptions.find((opt) => opt.label === label);
              if (selected) {
                setSelectedFilter(selected.value as "desc" | "asc");
                updateURL(selected.value as "desc" | "asc");
              }
            }}
            filterOptions={filterOptions.map((opt) => opt.label)}
          />
        </div>
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
