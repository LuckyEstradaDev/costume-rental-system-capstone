import {api} from "@/lib/axios";

export const modelUploadService = async (model: File | undefined) => {
  const formData = new FormData();
  if (model) {
    formData.append("model", model);
  }

  return api.post("/api/cloudinary/upload-model", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
