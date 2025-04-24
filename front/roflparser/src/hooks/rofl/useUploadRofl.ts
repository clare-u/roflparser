import { useState } from "react";
import { uploadRoflFile } from "@/libs/api/rofl";
import { toast } from "sonner";

export const useUploadRofl = () => {
  const [jsonData, setJsonData] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    // ✅ 파일 이름 형식 검사
    const fileName = file.name;
    const validNamePattern = /^KR-\d+\.rofl$/;

    if (!validNamePattern.test(fileName)) {
      toast.error("잘못된 형식의 파일입니다.");
      return; // ❌ 업로드 요청 보내지 않음
    }

    try {
      setIsUploading(true);
      setError(null);

      const data = await uploadRoflFile(file);
      setJsonData(data);
      toast.success("전적 업로드 성공!");
    } catch (err: any) {
      setError(err);
      toast.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return { jsonData, handleUpload, isUploading, error };
};
