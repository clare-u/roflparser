import { useQuery } from "@tanstack/react-query";
import { getMatchIdsByPuuid } from "@/libs";

interface UseMatchIdsByPuuidOptions {
  start?: number;
  count?: number;
  enabled?: boolean;
  retry?: boolean | number; // 재시도 옵션 추가
}

/**
 * 소환사의 PUUID를 기반으로 매치 ID 목록을 가져오는 훅
 */
export const useMatchIdsByPuuid = (
  puuid: string,
  options: UseMatchIdsByPuuidOptions = {}
) => {
  const { start = 0, count = 10, enabled = true, retry = 1 } = options;

  return useQuery({
    queryKey: ["matchIds", puuid, start, count],
    queryFn: () => getMatchIdsByPuuid(puuid, start, count),
    enabled: !!puuid && enabled,
    staleTime: 1000 * 60 * 5, // 5분 캐시
    retry, // 재시도 옵션 적용
  });
};
