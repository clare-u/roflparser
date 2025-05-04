import { useQuery } from "@tanstack/react-query";
import { getMatches } from "@/libs";
import { PaginatedMatchSummaryResponse } from "@/types";

export const useMatches = (
  sort: "asc" | "desc" = "desc",
  page: number,
  size: number = 10
) => {
  return useQuery<PaginatedMatchSummaryResponse, Error>({
    queryKey: ["matches", sort, page, size],
    queryFn: () => getMatches(sort, page, size),
    staleTime: 1000 * 60 * 1, // 1분 동안 fresh
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
