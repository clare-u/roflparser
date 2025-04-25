"use client";

import { useParams } from "next/navigation";
import MatchCard from "@/components/MatchCard";
import { useMatchesByPlayer } from "@/hooks/rofl";
import Loading from "@/components/loading/Loading";

export default function SearchPage() {
  const params = useParams<{ nickname: string }>();
  const raw = params.nickname;
  if (!raw) return <div>잘못된 요청입니다.</div>;

  const decoded = decodeURIComponent(raw); // e.g., '토러스#KR1'
  const [nickname, tagline] = decoded.split("#"); // tagline이 없으면 undefined

  const {
    data: matches,
    isLoading,
    error,
  } = useMatchesByPlayer(nickname, tagline);

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
