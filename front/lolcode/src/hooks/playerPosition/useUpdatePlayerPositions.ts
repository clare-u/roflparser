import { useMutation } from "@tanstack/react-query";
import { updatePlayerPositions } from "@/libs";
import { PlayerPositionRequest } from "@/types";

/**
 * 포지션별 티어 수정하는 훅 (PUT)
 */
export const useUpdatePlayerPositions = (nickname: string) => {
  return useMutation({
    mutationFn: (data: PlayerPositionRequest) =>
      updatePlayerPositions(nickname, data),
  });
};
