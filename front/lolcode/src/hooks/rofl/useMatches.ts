import { useQuery } from "@tanstack/react-query";
import { getMatches } from "@/libs";
import { MatchSummary } from "@/types/rofl";

export const useMatches = (sort: "asc" | "desc" = "desc") => {
  return useQuery<MatchSummary[], Error>({
    queryKey: ["matches", sort],
    queryFn: () => getMatches(sort),
    staleTime: 1000 * 60 * 1, // 1분 동안 fresh
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
