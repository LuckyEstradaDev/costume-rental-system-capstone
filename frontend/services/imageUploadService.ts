import {api} from "@/lib/axios";

export const imageUploadService = async (image: File | undefined) => {
  const formData = new FormData();
  if (image) {
    formData.append("image", image);
  }

  return api.post("/api/cloudinary/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
