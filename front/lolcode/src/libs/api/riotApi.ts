/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

// 라이엇 API 키 설정
if (!process.env.NEXT_PUBLIC_RIOT_API_KEY) {
  throw new Error("RIOT API KEY가 설정되지 않았습니다.");
}

const RIOT_API_KEY = process.env.NEXT_PUBLIC_RIOT_API_KEY;

// 라이엇 API 기본 리전 설정
export const REGIONS = {
  KOREA: "kr",
  ASIA: "asia",
};

// 라이엇 API 서버
export const RIOT_API_SERVERS = {
  PLATFORM: "https://kr.api.riotgames.com",
  REGIONAL: "https://asia.api.riotgames.com",
  ASIA: "https://asia.api.riotgames.com", // ✅ 이 줄을 추가
};

// 라이엇 API용 인스턴스 생성
const riotApi = axios.create({
  timeout: 10000,
  headers: {
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "X-Riot-Token": RIOT_API_KEY,
  },
});

// 라이엇 API 요청 함수
export const handleRiotApiRequest = async <T>(
  endpoint: string,
  server: string = RIOT_API_SERVERS.PLATFORM,
  params: Record<string, any> = {}
): Promise<T> => {
  try {
    const response = await riotApi.get<T>(`${server}${endpoint}`, { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 403) {
        throw new Error(
          "API 키가 만료되었거나 유효하지 않습니다. API 키를 갱신해주세요."
        );
      } else if (status === 404) {
        throw new Error("요청한 정보를 찾을 수 없습니다.");
      } else if (status === 429) {
        throw new Error(
          "API 호출 제한을 초과했습니다. 잠시 후 다시 시도해주세요."
        );
      }

      throw new Error(
        `라이엇 API 오류: ${
          error.response?.data?.status?.message || "알 수 없는 오류"
        }`
      );
    }
    throw error;
  }
};

export default riotApi;
