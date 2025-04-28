"use client";
import { useGetAllPlayers } from "@/hooks";
import Link from "next/link";
import Loading from "@/components/loading/Loading";

export default function Profile() {
  const { data: players, isLoading, error } = useGetAllPlayers();

  if (isLoading)
    return (
      <div className="flex w-full max-w-[1200px] flex-col gap-[20px] py-[20px]">
        <Loading />
      </div>
    );

  if (error) return <div>에러 발생</div>;

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-[40px] px-[40px] py-[60px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {players?.map((player) => {
          const full = `${player.riotIdGameName}#${player.riotIdTagLine}`;
          const encodedFull = encodeURIComponent(full);

          return (
            <div key={full} className="text-[20px] hover:underline">
              <Link href={`/profile/${encodedFull}`}>
                {player.riotIdGameName} #{player.riotIdTagLine}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
