"use client";
// import { useState } from "react";
// import SearchInput from "@/components/input/SearchInput";
import Rofl from "@/components/Rofl";

export default function Home() {
  // const [search, setSearch] = useState<string>("");

  return (
    <>
      <div className="flex w-full max-w-[1200px] flex-col gap-[80px] px-[40px] py-[60px]">
        {/* <div>
          <SearchInput
            placeholder="닉네임으로 검색하세요"
            value={search}
            onChange={}
          />
        </div> */}

        <Rofl />

        <div className="flex items-center justify-between">
          <img
            src="/main.png"
            alt="최근 전적 이미지"
            className="h-auto w-[600px] rounded-[10px] shadow-2xl"
          />
          <div className="flex flex-col gap-[40px]">
            <div className="flex flex-col gap-[10px]">
              <div className="text-[20px] font-semibold text-green-600">
                💡 사용자 설정 게임 전적 저장
              </div>
              <div className="text-[40px] font-bold">전적을 저장하고</div>
              <div className="text-[40px] font-bold">닉네임으로 검색하고</div>
              <div className="text-[40px] font-bold">디스코드에서 확인해요</div>
            </div>
            <div className="flex flex-col gap-[10px]">
              <div className="text-[18px]">
                번거로운 건 내전봇이 다 해드릴게요
              </div>
              <div className="text-[18px]">
                오직 리플레이 파일만 업로드해 전적을 저장하세요
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
