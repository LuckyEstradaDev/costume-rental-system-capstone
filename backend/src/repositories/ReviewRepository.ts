import type {IReview} from "../interfaces/IReview.js";
import {ReviewModel} from "../models/ReviewModel.js";

export class ReviewRepository {
  async addReview(data: IReview) {
    return await ReviewModel.create(data);
  }

  async updateReview(reviewID: string, data: Pick<IReview, "stars" | "comment">) {
    return await ReviewModel.findByIdAndUpdate(reviewID, data, {
      new: true,
      runValidators: true,
    });
  }

  async getReviewsByOutfitId(outfitID: string) {
    return await ReviewModel.find({outfitID});
  }

  async getReviewsByUserId(userID: string) {
    return await ReviewModel.find({userID});
  }
}
