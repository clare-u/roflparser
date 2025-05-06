"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useMatchesByPlayer } from "@/hooks/rofl";
import Loading from "@/components/loading/Loading";
import PlayerMatchCard from "@/components/PlayerMatchCard";

interface FilterOption {
  label: string;
  value: "desc" | "asc";
}

export default function SearchPage() {
  const router = useRouter();
  const params = useParams<{ nickname: string }>();
  const searchParams = useSearchParams();

  const raw = params.nickname ?? "";
  const decoded = decodeURIComponent(raw); // e.g., '토러스#KR1'
  const [nickname, tagline] = decoded.split("#");

  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam) : 1;

  // 필터
  const filterOptions: FilterOption[] = [
    { label: "최신순", value: "desc" },
    { label: "오래된순", value: "asc" },
  ];
  const currentOrder = (searchParams.get("sort") as "desc" | "asc") || "desc";
  const [selectedFilter, setSelectedFilter] = useState<"desc" | "asc">(
    currentOrder
  );

  const {
    data: stats,
    isLoading,
    error,
  } = useMatchesByPlayer(nickname, tagline, selectedFilter, currentPage - 1);

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

  const firstStats = Array.isArray(stats) ? stats[0] : stats;

  if (!nickname) return <div>잘못된 요청입니다.</div>;

  if (isLoading)
    return (
      <div className="flex w-full max-w-[1200px] flex-col gap-[20px] py-[20px]">
        <Loading />
      </div>
    );

  if (error) return <div>에러 발생: {error.message}</div>;

  console.log(stats);

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-[20px] px-[5px] desktop:px-[40px] py-[40px] desktop:py-[60px]">
      {stats && (
        <>
          <PlayerMatchCard
            player={firstStats}
            currentPage={currentPage}
            selectedLabel={selectedLabel}
            filterOptions={filterOptions}
            setSelectedFilter={setSelectedFilter}
            updateURL={updateURL}
          />
        </>
      )}
    </div>
  );
}
