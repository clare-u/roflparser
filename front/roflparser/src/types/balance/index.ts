import { Position } from "@/types/rofl";

// BalanceScores
export type BalanceScores = {
  [tierName: string]: {
    [position in keyof typeof Position]: number;
  };
};
