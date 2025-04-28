import { Position } from "@/types";

export const getPositionKoreanName = (position: Position): string => {
  switch (position) {
    case Position.TOP:
      return "탑";
    case Position.JUNGLE:
      return "정글";
    case Position.MIDDLE:
      return "미드";
    case Position.BOTTOM:
      return "원딜";
    case Position.UTILITY:
      return "서폿";
    default:
      return "알 수 없는 포지션";
  }
};

export const mapPositionLabel = (position: string) => {
  switch (position) {
    case "TOP":
      return "TOP";
    case "JUNGLE":
      return "JUG";
    case "MIDDLE":
      return "MID";
    case "BOTTOM":
      return "ADC";
    case "UTILITY":
      return "SUP";
    default:
      return position;
  }
};
