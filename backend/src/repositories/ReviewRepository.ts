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
    return this.addProfilePictures(reviews.map((review) => review.commentHidden
      ? {...review, comment: undefined, reply: undefined, replyRole: undefined}
      : review));
  }

  private async addProfilePictures<T extends {userID: {toString(): string}}>(reviews: T[]) {
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

  async moderateReview(id: string, changes: {commentHidden?: boolean; reply?: string; replyRole?: "admin" | "staff"}) {
    return ReviewModel.findByIdAndUpdate(id, {$set: changes}, {new: true, runValidators: true});
  }

  async getAllReviews(moderation: boolean) {
    const reviews = await ReviewModel.find(moderation ? {} : {commentHidden: {$ne: true}})
      .sort({createdAt: -1}).lean();
    return moderation ? this.addProfilePictures(reviews) : reviews;
  }
}
