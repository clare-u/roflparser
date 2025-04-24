"use client";

import { useParams } from "next/navigation";

export default function SearchPage() {
  const params = useParams();
  const nickname = decodeURIComponent(params.nickname as string);

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-[100px] px-[40px] py-[80px]">
      <h1 className="text-2xl font-bold">검색 결과: {nickname}</h1>
    </div>
  );
}
