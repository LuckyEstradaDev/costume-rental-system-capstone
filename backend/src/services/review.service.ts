import type {IReview} from "../interfaces/IReview.js";
import {ReviewRepository} from "../repositories/ReviewRepository.js";

const reviewRepo = new ReviewRepository();

export const addReviewService = async (data: IReview) => {
  return reviewRepo.addReview(data);
};

export const getReviewsByOutfitIdService = async (outfitID: string) => {
  return reviewRepo.getReviewsByOutfitId(outfitID);
};
