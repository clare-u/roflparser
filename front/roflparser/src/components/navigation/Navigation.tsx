"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavigationItem from "./NavigationItem";
import SearchInput from "../input/SearchInput";
// import NavigationProfile from "./NavigationProfile";
// import { useUserStore } from "@/store/userStore";
// import { useFetchUser } from "@/hooks";
// import Loading from "../loading/Loading";

const Navigation = () => {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState<string>("");
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return; // 빈 문자열이면 라우팅하지 않음

    router.push(`/search/${trimmed}`);
  };

  // const user = useUserStore((state) => state.user); // zustand에서 현재 member 상태 가져오기
  // const setUser = useUserStore((state) => state.setUser); // zustand에서 setMember 가져오기
  // const [fetchData, setFetchData] = useState(false); // API 호출 여부를 제어하기 위한 로컬 상태

  // useEffect(() => {
  //   if (!user) {
  //     setFetchData(true); // member가 없으면 데이터를 받아오도록 설정
  //   }
  // }, [user]);

  // const { data: userData, isLoading, error } = useFetchUser(); // 인자 없이 호출

  // useEffect(() => {
  //   if (userData && !user && fetchData) {
  //     setUser(userData); // member 상태가 없을 때만 zustand에 저장
  //     setFetchData(false); // 데이터를 받아온 후 다시 API 호출을 막기 위해 설정
  //   }
  // }, [userData, user, setUser, fetchData]);

  return (
    <nav className="sticky top-0 z-50 flex h-[80px] items-center justify-between bg-indigo-800 px-40">
      {/* 로고 영역 */}
      <Link href="/">
        <Image src="/logo.png" alt="Logo" width={110} height={40} priority />
      </Link>

      {/* 메뉴 영역 */}
      <div className="flex gap-[36px] p-10">
        <NavigationItem href="/recent">최근 전적</NavigationItem>
      </div>

      {/* 프로필 영역 */}
      <div className="flex gap-36 p-10">
        {/* {isLoading ? (
          // 로딩 중일 때 표시할 로딩 스피너 또는 텍스트
          <Loading />
        ) : userData ? (
          <NavigationProfile
            image={userData.userImageUrl}
            nickname={userData.userNickname}
            email={userData.userEmail}
            repo={userData.userRepo}
          />
        )  
        : (*/}
        <SearchInput
          placeholder="닉네임으로 검색하세요"
          value={searchValue}
          onChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
        />

        {/* <NavigationItem href="/login" icon="login">
          login
        </NavigationItem> */}
      </div>
    </nav>
  );
};

export default Navigation;
