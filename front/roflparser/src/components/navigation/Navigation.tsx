"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavigationItem from "./NavigationItem";
import SearchInput from "../input/SearchInput";
import { getPlayersByNickname } from "@/libs";
import { toast } from "sonner";

const Navigation = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const [searchValue, setSearchValue] = useState<string>("");
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // 내부 공백 모두 제거
    const noSpaces = trimmed.replace(/\s+/g, "");

    if (noSpaces.includes("#")) {
      router.push(`/profile/${encodeURIComponent(noSpaces)}`);
      return;
    }

    try {
      const players = await getPlayersByNickname(noSpaces);
      if (players.length > 0) {
        const full = `${players[0].riotIdGameName}#${players[0].riotIdTagLine}`;
        router.push(`/profile/${encodeURIComponent(full)}`);
      } else {
        toast.error("해당 닉네임의 플레이어를 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error("플레이어 조회 실패", err);
      toast.error("플레이어 조회 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 flex h-[80px] w-full items-center justify-center bg-indigo-800 px-[40px]">
        <div className="flex w-full max-w-[1200px] h-full items-center justify-between">
          {/* 로고 영역 */}
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={130}
              height={45}
              priority
            />
          </Link>

          <button
            onClick={toggleMenu}
            className="desktop:hidden flex p-[5px] cursor-pointer text-white"
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "32px",
                fontVariationSettings:
                  "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 32",
              }}
            >
              menu
            </span>
          </button>

          {/* 메뉴 영역 */}
          <div className="hidden desktop:flex gap-[36px] p-[10px]">
            <NavigationItem href="/recent">최근 전적</NavigationItem>
            <NavigationItem href="/profile">프로필</NavigationItem>
            <NavigationItem href="/statistics">통계</NavigationItem>
          </div>

          {/* 검색 영역 */}
          <div className="hidden desktop:flex gap-[36px] p-[10px]">
            <SearchInput
              placeholder="닉네임으로 검색하세요"
              value={searchValue}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
            />
          </div>
        </div>
      </nav>

      {/* 모바일용 메뉴 (토글 열림 시 표시) */}
      {isOpen && (
        <div className="flex flex-col gap-[10px] pb-[20px] px-[30px] desktop:hidden bg-indigo-800 text-white justify-center items-end">
          <NavigationItem href="/recent">최근 전적</NavigationItem>
          <NavigationItem href="/profile">프로필</NavigationItem>
          <NavigationItem href="/statistics">통계</NavigationItem>
          <SearchInput
            placeholder="닉네임으로 검색하세요"
            value={searchValue}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />
        </div>
      )}
    </>
  );
};

export default Navigation;
