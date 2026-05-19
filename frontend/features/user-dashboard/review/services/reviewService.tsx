import {api} from "@/lib/axios";
import {IReview} from "../types/IReview";

export const createReview = async (review: IReview) => {
  return api.post("/api/reviews/", review);
};

export const updateReview = async (
  reviewID: string,
  review: Pick<IReview, "stars" | "comment">,
) => {
  return api.put(`/api/reviews/${reviewID}`, review);
};

export const getReviewsByOutfitId = async (outfitID: string) => {
  return api.get(`/api/reviews/${outfitID}`);
};

export const getReviewsByUserId = async (userID: string) => {
  return api.get(`/api/reviews/user/${userID}`);
};
