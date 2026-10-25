import type {IReview} from "../interfaces/IReview.js";
import {ReviewModel} from "../models/ReviewModel.js";
import {UserModel} from "../models/UserModel.js";

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
    const reviews = await ReviewModel.find({outfitID}).lean();
    const userIds = [
      ...new Set(reviews.map((review) => review.userID.toString())),
    ];
    const users = await UserModel.find({_id: {$in: userIds}})
      .select("profilePicture")
      .lean();
    const picturesByUserId = new Map(
      users.map((user) => [
        user._id.toString(),
        user.profilePicture ?? null,
      ]),
    );

    return reviews.map((review) => ({
      ...review,
      profilePicture:
        picturesByUserId.get(review.userID.toString()) ?? null,
    }));
  }

  async getReviewsByUserId(userID: string) {
    return await ReviewModel.find({userID});
  }

  async getAllReviews() {
    return await ReviewModel.find().sort({createdAt: -1});
  }
}
