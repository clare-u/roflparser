import { handleApiRequest } from "../client";

export const uploadRoflFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  return handleApiRequest<string, "post", FormData>(
    "/api/rofl/upload",
    "post",
    formData
  );
};
