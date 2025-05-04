import { useState, useEffect } from "react";
import Link from "next/link";

interface Props {
  totalItems: number;
  itemCountPerPage: number;
  pageCount: number;
  currentPage: number;
}

export default function Pagination({
  totalItems,
  itemCountPerPage,
  pageCount,
  currentPage,
}: Props) {
  const totalPages = Math.ceil(totalItems / itemCountPerPage);
  const [start, setStart] = useState(1);
  const noPrev = start === 1;
  const noNext = start + pageCount - 1 >= totalPages;

  useEffect(() => {
    if (currentPage === start + pageCount) setStart((prev) => prev + pageCount);
    if (currentPage < start) setStart((prev) => prev - pageCount);
  }, [currentPage, pageCount, start]);

  return (
    <div className="flex items-center justify-center gap-[10px] text-nowrap p-[10px] text-sm text-gray-600">
      <ul className="flex list-none items-center justify-center gap-[10px]">
        {/* 이전 Button */}
        <li className={`${noPrev ? "invisible" : ""}`}>
          <Link
            href={`?page=${start - 1}`}
            className="inline-block cursor-pointer text-center hover:underline"
          >
            <span className="left-0">&lt;</span> 이전
          </Link>
        </li>

        {/* Page 번호 */}
        {[...Array(pageCount)].map((_, i) => (
          <li key={i}>
            {start + i <= totalPages && (
              <Link
                href={`?page=${start + i}`}
                className={`flex items-center justify-center rounded-[8px] border p-[10px] text-[13px] transition-all ${
                  currentPage === start + i
                    ? "bg-indigo-800 font-bold text-white"
                    : "border-transparent hover:underline"
                }`}
              >
                {start + i}
              </Link>
            )}
          </li>
        ))}

        {/* 다음 Button */}
        <li className={`${noNext ? "invisible" : ""}`}>
          <Link
            href={`?page=${start + pageCount}`}
            className="inline-block cursor-pointer text-center hover:underline"
          >
            다음 <span className="right-[0px]">&gt;</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
