"use client";

import { useState } from "react";
import BalanceTable from "@/components/BalanceTable";

export default function Balance() {
  const [showTable, setShowTable] = useState(false);

  const toggleTable = () => {
    setShowTable((prev) => !prev);
  };

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-[40px] px-[40px] py-[60px]">
      <button
        onClick={toggleTable}
        className="w-fit rounded-md hover:font-bold transition"
      >
        {showTable ? "▼ 점수 표 숨기기" : "▶ 점수 표 보기"}
      </button>

      {showTable && (
        <div className="mt-6">
          <BalanceTable />
        </div>
      )}
    </div>
  );
}
