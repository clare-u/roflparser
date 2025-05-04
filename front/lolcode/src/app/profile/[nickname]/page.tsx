"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMatchesByPlayer } from "@/hooks/rofl";
import Loading from "@/components/loading/Loading";
import PlayerMatchCard from "@/components/PlayerMatchCard";

export default function SearchPage() {
  const params = useParams<{ nickname: string }>();
  const searchParams = useSearchParams();

  const raw = params.nickname ?? "";
  const decoded = decodeURIComponent(raw); // e.g., '토러스#KR1'
  const [nickname, tagline] = decoded.split("#");

  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam) : 1;

  const {
    data: stats,
    isLoading,
    error,
  } = useMatchesByPlayer(nickname, tagline, "desc", currentPage - 1);

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
    <div className="flex w-full max-w-[1200px] flex-col gap-[20px] py-[40px]">
      {stats && (
        <>
          <PlayerMatchCard player={firstStats} currentPage={currentPage} />
        </>
      )}
    </div>
  );
}
