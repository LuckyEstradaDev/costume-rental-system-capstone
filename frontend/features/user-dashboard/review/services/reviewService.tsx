import {api} from "@/lib/axios";
import {IReview} from "../types/IReview";

export const createReview = async (review: IReview) => {
  return api.post("/api/reviews/", review);
};
