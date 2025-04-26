"use client";

import { useBalanceScores } from "@/hooks/balance";
import { getPositionKoreanName } from "@/utils/position";
import { Position } from "@/types";

export default function BalanceTable() {
  const { data, isLoading, error } = useBalanceScores();

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error || !data) {
    return <div>에러가 발생했습니다.</div>;
  }

  // 티어/포지션/점수로 펼쳐서 flat하게 만든 리스트
  const rows = Object.entries(data).flatMap(([tierName, positions]) =>
    Object.entries(positions).map(([position, score]) => ({
      tierName,
      position: position as keyof typeof Position, // ← 여기 포인트
      score: score as number, // ← 안전하게 number로 확정
    }))
  );

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[600px] table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border border-gray-300 px-4 py-2">티어</th>
            <th className="border border-gray-300 px-4 py-2">포지션</th>
            <th className="border border-gray-300 px-4 py-2">점수</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.tierName}-${row.position}-${index}`}
              className="text-center"
            >
              <td className="border border-gray-300 px-4 py-2">
                {row.tierName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {getPositionKoreanName(Position[row.position])}
              </td>
              <td className="border border-gray-300 px-4 py-2">{row.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
