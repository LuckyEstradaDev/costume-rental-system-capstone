import type {IReview} from "../interfaces/IReview.js";
import {ReviewRepository} from "../repositories/ReviewRepository.js";

const reviewRepo = new ReviewRepository();

export const addReviewService = async (data: IReview) => {
  return reviewRepo.addReview(data);
};

export const updateReviewService = async (
  reviewID: string,
  data: Pick<IReview, "stars" | "comment">,
) => {
  return reviewRepo.updateReview(reviewID, data);
};

export const getReviewsByOutfitIdService = async (outfitID: string) => {
  return reviewRepo.getReviewsByOutfitId(outfitID);
};

export const getReviewsByUserIdService = async (userID: string) => {
  return reviewRepo.getReviewsByUserId(userID);
};

export const getAllReviewsService = async (moderation = false) => {
  return reviewRepo.getAllReviews(moderation);
};

export const deleteReviewService = async (reviewID: string) => {
  return reviewRepo.deleteReview(reviewID);
};

export const moderateReviewService = (id: string, changes: {commentHidden?: boolean; reply?: string; replyRole?: "admin" | "staff"}) =>
  reviewRepo.moderateReview(id, changes);
