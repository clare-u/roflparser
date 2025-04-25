"use client";
import Loading from "@/components/loading/Loading";
import MatchCard from "@/components/MatchCard";
import { useMatch } from "@/hooks/rofl";
import { useParams } from "next/navigation";

export default function SearchPage() {
  const { matchId } = useParams() as { matchId: string };
  const { data: match, isLoading, error } = useMatch(matchId);

  if (isLoading)
    return (
      <div className="flex w-full max-w-[1200px] flex-col gap-[20px] py-[20px]">
        <Loading />;
      </div>
    );

  if (error || !match)
    return <div>에러 발생: {error?.message ?? "데이터가 없습니다."}</div>;

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-[20px] py-[40px]">
      <div>
        <MatchCard match={match} />
      </div>
    </div>
  );
}
