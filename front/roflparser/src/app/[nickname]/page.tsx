"use client";

import { useParams } from "next/navigation";
import MatchCard from "@/components/MatchCard";
import { useMatchesByPlayer } from "@/hooks/rofl";
import Loading from "@/components/loading/Loading";

export default function SearchPage() {
  const params = useParams<{ nickname: string }>();
  const raw = params.nickname ?? "";
  const decoded = decodeURIComponent(raw); // e.g., '토러스#KR1'
  const [nickname, tagline] = decoded.split("#");

  // ✅ 훅은 최상단에서 항상 실행되도록 함
  const {
    data: matches,
    isLoading,
    error,
  } = useMatchesByPlayer(nickname, tagline);

  if (!nickname) return <div>잘못된 요청입니다.</div>;

  if (isLoading)
    if (isLoading)
      return (
        <div className="flex w-full max-w-[1200px] flex-col gap-[20px] py-[20px]">
          <Loading />;
        </div>
      );

  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-[20px] py-[40px]">
      <div>
        {nickname} #{tagline}
      </div>
      {matches?.map((match) => (
        <MatchCard key={match.matchId} match={match} />
      ))}
    </div>
  );
}
