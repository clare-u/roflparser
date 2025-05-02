/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useUploadRofl } from "@/hooks/rofl";

export default function Rofl() {
  const [file, setFile] = useState<File | null>(null);

  const { handleUpload, isUploading } = useUploadRofl();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-[0px] w-[60%]">
        <div className="w-[100%] p-[10px] text-[40px] font-bold leading-tight">
          리플레이 파일(.rofl)을
        </div>
        <div className="w-[100%] p-[10px] text-[40px] font-bold leading-tight">
          업로드하세요
        </div>
      </div>
      <div className="bg-gray-200 p-[10px] rounded-[10px] w-[100%] shadow-xl">
        <div>
          <div className="flex p-[10px] justify-between">
            <div className="py-4">
              {/* 숨겨진 input */}
              <input
                id="file-upload"
                type="file"
                accept=".rofl"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />

              {/* 사용자 정의 버튼 */}
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                파일 선택
              </label>

              {/* 선택된 파일 이름 */}
              <span className="text-sm text-gray-700 py-2 px-4 rounded-lg w-[100%]">
                {file ? `${file.name}` : "선택된 파일 없음"}
              </span>
            </div>
            <button
              onClick={() => file && handleUpload(file)}
              className={`mt-2 px-4 py-2 font-semibold rounded-[10px] ${
                file && !isUploading
                  ? "bg-green-500 hover:bg-green-700 text-white cursor-pointer"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
              disabled={!file || isUploading}
            >
              전적 업로드
            </button>
          </div>
          <div className="p-[10px] text-[12px]">
            리플레이 파일 경로는 📁문서\League of Legends\Replays
          </div>
        </div>
        {/* {jsonData && (
          <div className="mt-4 bg-gray-100 p-4 overflow-auto max-h-[400px] rounded-[10px]">
            {jsonData}
          </div>
        )} */}
      </div>
    </div>
  );
}
