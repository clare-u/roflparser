import { useQuery } from "@tanstack/react-query";
import { fetchLolVersions } from "@/libs";

/**
 * 최신 LoL 버전을 가져오는 React Query 훅
 */
export const useLatestLolVersion = () => {
  return useQuery({
    queryKey: ["latestLolVersion"],
    queryFn: async () => {
      const versions = await fetchLolVersions();
      return versions[0]; // 가장 최신 버전
    },
    staleTime: 1000 * 60 * 60 * 6, // 6시간 동안 fresh
  });
};
