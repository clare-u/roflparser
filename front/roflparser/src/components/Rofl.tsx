/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useUploadRofl } from "@/hooks/rofl";
import { toast } from "sonner";

export default function Rofl() {
  const [file, setFile] = useState<File | null>(null);

  const [description, setDescription] = useState<string>(
    "등록하실 리플레이 파일을 선택하거나 올려주세요"
  );

  // 사용자가 파일을 드래그 중임을 상태로 관리 (UI 변경을 위해 사용)
  const [dragOver, setDragOver] = useState<boolean>(false);

  // 드래그 중인 요소가 목표 지점 진입할때
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  // 드래그 중인 요소가 목표 지점을 벗어날때
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  // 드래그 중인 요소가 목표 지점에 위치할때
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 드래그 중인 요소가 목표 지점에서 드롭될때
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    // 확장자 검사
    const isRofl = droppedFile.name.toLowerCase().endsWith(".rofl");
    if (!isRofl) {
      toast.error(".rofl 파일만 업로드할 수 있습니다.");
      return;
    }

    setFile(droppedFile);
    setDescription(droppedFile.name);
  };

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

      <div className="bg-gray-200 p-[10px] rounded-[10px] w-full shadow-xl">
        <div className="flex w-full p-[10px]  justify-center items-center gap-[5px]">
          <div className="w-full">
            {/* 사용자 정의 버튼 */}
            <label
              className={`block w-full flex-col gap-3 h-32 border-2 ${
                dragOver
                  ? "border-blue-500 bg-blue-100 text-blue-500 font-semibold"
                  : "border-gray-300"
              } rounded-md flex items-center justify-center cursor-pointer`}
              htmlFor="file-upload"
              // Label에 드래그 앤 드랍 이벤트 추가
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="">{description}</div>
              <div className="flex w-9 h-9 pointer-events-none items-center justify-center">
                <span className="material-symbols-outlined">add_circle</span>
              </div>
            </label>
            {/* 숨겨진 input */}
            <input
              id="file-upload"
              type="file"
              accept=".rofl"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;
                if (!selectedFile) return;

                if (!selectedFile.name.toLowerCase().endsWith(".rofl")) {
                  toast.error(".rofl 파일만 선택할 수 있습니다.");
                  return;
                }

                setFile(selectedFile);
                setDescription(selectedFile.name);
                e.target.value = "";
              }}
              className="hidden"
            />
          </div>
        </div>
        <div className="flex justify-between px-[10px] py-[2px] items-end">
          <div className=" text-[12px]">
            리플레이 파일 경로는 📁문서\League of Legends\Replays
          </div>
          <button
            onClick={() => file && handleUpload(file)}
            className={`px-4 py-2 font-semibold rounded-[10px] h-[40px] text-nowrap ${
              file && !isUploading
                ? "bg-blue-700 hover:bg-blue-900 text-white cursor-pointer"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
            disabled={!file || isUploading}
          >
            전적 업로드
          </button>
        </div>
      </div>
    </div>
  );
}
