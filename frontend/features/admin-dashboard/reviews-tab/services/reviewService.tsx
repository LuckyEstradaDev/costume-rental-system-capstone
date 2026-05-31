import {api} from "@/lib/axios";
import {IReview} from "@/features/user-dashboard/review/types/IReview";

export const getAllReviewsService = async () => {
  return api.get<IReview[]>("/api/reviews");
};
