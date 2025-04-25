import { handleApiRequest } from "../client";
import { MatchSummary } from "@/types/rofl";

export const uploadRoflFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  return handleApiRequest<string, "post", FormData>(
    "/api/rofl/upload",
    "post",
    formData
  );
};

// 저장된 모든 경기 정보를 조회하는 API (정렬 순서: asc 또는 desc, 기본은 desc)
export const getMatches = async (sort: "asc" | "desc" = "desc") => {
  return handleApiRequest<MatchSummary[], "get">(
    `/api/matches?sort=${sort}`,
    "get"
  );
};

// 개별 matchId로 경기 상세 정보 조회
export const getMatchById = async (matchId: string) => {
  return handleApiRequest<MatchSummary, "get">(
    `/api/matches/${matchId}`,
    "get"
  );
};
