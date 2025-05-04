import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  totalItems: number;
  itemCountPerPage: number;
  pageCount: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  totalItems,
  itemCountPerPage,
  pageCount,
  currentPage,
  onPageChange,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / itemCountPerPage);
  const [start, setStart] = useState(1);
  const noPrev = start === 1;
  const noNext = start + pageCount - 1 >= totalPages;

  useEffect(() => {
    if (currentPage === start + pageCount) setStart((prev) => prev + pageCount);
    if (currentPage < start) setStart((prev) => prev - pageCount);
  }, [currentPage, pageCount, start]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    onPageChange?.(page);
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-[10px] text-nowrap p-[10px] text-sm text-gray-600">
      <ul className="flex list-none items-center justify-center gap-[10px]">
        {/* 이전 Button */}
        <li className={`${noPrev ? "invisible" : ""}`}>
          <button
            onClick={() => handlePageChange(start - 1)}
            className="inline-block cursor-pointer text-center hover:underline"
          >
            <span className="left-0">&lt;</span> 이전
          </button>
        </li>

        {/* Page 번호 */}
        {[...Array(pageCount)].map((_, i) => {
          const page = start + i;
          return (
            page <= totalPages && (
              <li key={i}>
                <button
                  onClick={() => handlePageChange(page)}
                  className={`flex items-center justify-center rounded-[8px] border p-[10px] text-[13px] transition-all ${
                    currentPage === page
                      ? "bg-indigo-800 font-bold text-white"
                      : "border-transparent hover:underline"
                  }`}
                >
                  {page}
                </button>
              </li>
            )
          );
        })}

        {/* 다음 Button */}
        <li className={`${noNext ? "invisible" : ""}`}>
          <button
            onClick={() => handlePageChange(start + pageCount)}
            className="inline-block cursor-pointer text-center hover:underline"
          >
            다음 <span className="right-[0px]">&gt;</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
