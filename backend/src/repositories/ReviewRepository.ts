import type {IReview} from "../interfaces/IReview.js";
import {ReviewModel} from "../models/ReviewModel.js";

export class ReviewRepository {
  async addReview(data: IReview) {
    return await ReviewModel.create(data);
  }

  async getReviewsByOutfitId(outfitID: string) {
    return await ReviewModel.find({outfitID});
  }
}
