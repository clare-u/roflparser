"use client";

import { useBalanceScores } from "@/hooks/balance";
import { getPositionKoreanName } from "@/utils/position";
import { Position } from "@/types";
import Loading from "./loading/Loading";

export default function BalanceTable() {
  const { data, isLoading, error } = useBalanceScores();

  if (isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    return <div>에러가 발생했습니다.</div>;
  }

  // 포지션 순서 고정 (탑, 정글, 미드, 원딜, 서폿)
  const positionOrder: Position[] = [
    Position.TOP,
    Position.JUNGLE,
    Position.MIDDLE,
    Position.BOTTOM,
    Position.UTILITY,
  ];

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[800px] table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border border-gray-300 px-4 py-2">티어</th>
            {positionOrder.map((position) => (
              <th key={position} className="border border-gray-300 px-4 py-2">
                {getPositionKoreanName(position)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([tierName, positions]) => (
            <tr key={tierName} className="text-center">
              <td className="border border-gray-300 px-4 py-2 font-semibold">
                {tierName}
              </td>
              {positionOrder.map((position) => (
                <td key={position} className="border border-gray-300 px-4 py-2">
                  {positions[position]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
