import { useMutation } from "@tanstack/react-query";
import { createPlayerPositions } from "@/libs";
import { PlayerPositionRequest } from "@/types";

/**
 * 포지션별 티어 등록하는 훅 (POST)
 */
export const useCreatePlayerPositions = () => {
  return useMutation({
    mutationFn: (data: PlayerPositionRequest) => createPlayerPositions(data),
  });
};
