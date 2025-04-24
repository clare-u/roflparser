"use client";
import Loading from "@/components/loading/Loading";
import MatchCard from "@/components/MatchCard";
import { useMatches } from "@/hooks/rofl";

export default function SearchPage() {
  const { data: matches, isLoading, error } = useMatches("desc");

  if (isLoading) return <Loading />;
  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-[20px] py-[20px]">
      <h1 className="text-2xl font-bold">최근 전적</h1>
      <div>
        {matches?.map((match) => (
          <MatchCard key={match.matchId} match={match} />
        ))}
      </div>
    </div>
  );
}
