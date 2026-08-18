import {api} from "@/lib/axios";
import {IReview} from "@/features/user-dashboard/review/types/IReview";

export const getAllReviewsService = async () => {
  const res = await api.get<IReview[]>("/api/reviews");
  return res.data;
};
