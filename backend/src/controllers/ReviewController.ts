import type {Request, Response} from "express";
import {
  addReviewService,
  getReviewsByOutfitIdService,
  getReviewsByUserIdService,
  updateReviewService,
} from "../services/review.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

export const addReviewController = async (req: Request, res: Response) => {
  try {
    const {outfitID, userID, stars, comment} = req.body as {
      outfitID?: string;
      userID?: string;
      stars?: number | string;
      comment?: string;
    };
    const reviewOutfitId = outfitID;
    const reviewUserId = userID;
    const numericStars = Number(stars);

    if (!reviewOutfitId) {
      return res.status(400).json({message: "outfitID is required"});
    }

    if (!reviewUserId) {
      return res.status(400).json({message: "userID is required"});
    }

    if (!Number.isFinite(numericStars)) {
      return res.status(400).json({message: "stars is required"});
    }

    if (numericStars < 1 || numericStars > 5) {
      return res.status(400).json({message: "stars must be between 1 and 5"});
    }

    const reviewData = {
      outfitID: reviewOutfitId,
      userID: reviewUserId,
      stars: numericStars,
      comment: comment || "",
    };

    console.log("Received review data:", reviewData);

    const review = await addReviewService(reviewData);

    return res.status(201).json(review);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to add review.");
  }
};

export const getReviewsByOutfitIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {outfitID} = req.params as {outfitID: string};

    const reviews = await getReviewsByOutfitIdService(outfitID);

    return res.status(200).json(reviews);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch outfit reviews.");
  }
};

export const updateReviewController = async (req: Request, res: Response) => {
  try {
    const {reviewID} = req.params as {reviewID: string};
    const {stars, comment} = req.body as {
      stars?: number | string;
      comment?: string;
    };
    const numericStars = Number(stars);

    if (!Number.isFinite(numericStars)) {
      return res.status(400).json({message: "stars is required"});
    }

    if (numericStars < 1 || numericStars > 5) {
      return res.status(400).json({message: "stars must be between 1 and 5"});
    }

    const review = await updateReviewService(reviewID, {
      stars: numericStars,
      comment: comment || "",
    });

    if (!review) {
      return res.status(404).json({message: "Review not found."});
    }

    return res.status(200).json(review);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to update review.");
  }
};

export const getReviewsByUserIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {userID} = req.params as {userID: string};

    const reviews = await getReviewsByUserIdService(userID);

    return res.status(200).json(reviews);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch user reviews.");
  }
};
