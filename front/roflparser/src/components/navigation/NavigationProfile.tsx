"use client";

import Image from "next/image";
import { useState } from "react";
import MemberModal from "../modal/MemberModal";

interface NavigationProfileProps {
  image: string;
  nickname: string;
  email: string;
  repo?: string;
}

const NavigationProfile: React.FC<NavigationProfileProps> = ({
  image,
  nickname,
  email,
  repo,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleConfirm = () => {
    // confirm 버튼 클릭 시의 로직
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex h-[80px] items-center justify-center gap-10 whitespace-nowrap px-20 py-[26px] text-16 text-white ${
            isOpen ? "font-extrabold" : ""
          } hover:bg-indigo-900`}
        >
          <Image
            src={image ? `${image}` : "/profile.png"}
            alt={nickname}
            width={40}
            height={40}
            className="rounded-full"
          />
          {nickname}
          <span className="material-symbols-outlined">
            {isOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          </span>
        </button>

        {/* 버튼 바로 아래에 모달 표시 */}
        {/* TODO: 모달 완성 필요(모달버튼, 모달인풋 제작 필요) */}
        {isOpen && (
          <MemberModal
            image={image}
            nickname={nickname}
            email={email}
            repo={repo}
          />
        )}
      </div>
    </>
  );
};

export default NavigationProfile;
