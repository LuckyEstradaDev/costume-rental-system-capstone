import type {IReview} from "../interfaces/IReview.js";
import {ReviewModel} from "../models/ReviewModel.js";

export class ReviewRepository {
  async addReview(data: IReview) {
    return await ReviewModel.create(data);
  }

  async updateReview(
    reviewID: string,
    data: Pick<IReview, "stars" | "comment">,
  ) {
    return await ReviewModel.findByIdAndUpdate(reviewID, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteReview(reviewID: string) {
    return await ReviewModel.findByIdAndDelete(reviewID);
  }

  async getReviewsByOutfitId(outfitID: string) {
    return await ReviewModel.find({outfitID});
  }

  async getReviewsByUserId(userID: string) {
    return await ReviewModel.find({userID});
  }

  async getAllReviews() {
    return await ReviewModel.find().sort({createdAt: -1});
  }
}
