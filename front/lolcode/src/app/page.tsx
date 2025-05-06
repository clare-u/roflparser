"use client";

export default function Home() {
  return (
    <>
      <div className="flex w-full max-w-[1200px] flex-col gap-[40px] desktop:gap-[80px] px-[10px] desktop:px-[40px] py-[20px] desktop:py-[60px]">
        <div className="flex flex-col desktop:flex-row items-center gap-[40px] justify-between">
          <img
            src="/main.png"
            alt="최근 전적 이미지"
            className="hidden desktop:block h-auto w-[600px] rounded-[10px] shadow-2xl"
          />
          <div className="flex w-full flex-col gap-[40px] tablet:px-[20px]">
            <div className="flex flex-col gap-[10px]">
              <div className="pt-[20px] text-[20px] font-semibold text-green-600">
                💡 사용자 설정 게임 전적 저장
              </div>
              <div className="text-[20px] desktop:text-[35px] font-bold">
                전적을 저장하고
              </div>
              <div className="text-[20px] desktop:text-[35px] font-bold">
                닉네임으로 검색하고
              </div>
              <div className="text-[20px] desktop:text-[35px] font-bold">
                디스코드에서 확인해요
              </div>
            </div>
            <div className="flex flex-col gap-[10px]">
              <div className="text-right desktop:text-left text-[18px]">
                번거로운 건 내전봇이 다 해드릴게요
              </div>
              <div className="text-right desktop:text-left text-[18px]">
                오직 리플레이 파일만 업로드해
              </div>
              <div className="text-right desktop:text-left text-[18px]">
                전적을 저장하세요
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
