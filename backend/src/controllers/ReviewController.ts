import type {Request, Response} from "express";
import {
  addReviewService,
  getReviewsByOutfitIdService,
} from "../services/review.service.js";

export const addReviewController = async (req: Request, res: Response) => {
  try {
    const {outfitID, outfitId, stars, comment} = req.body as {
      outfitID?: string;
      outfitId?: string;
      stars?: number | string;
      comment?: string;
    };
    const reviewOutfitId = outfitID || outfitId;
    const numericStars = Number(stars);

    if (!reviewOutfitId) {
      return res.status(400).json({message: "outfitID is required"});
    }

    if (!Number.isFinite(numericStars)) {
      return res.status(400).json({message: "stars is required"});
    }

    if (numericStars < 1 || numericStars > 5) {
      return res.status(400).json({message: "stars must be between 1 and 5"});
    }

    const reviewData = {
      outfitID: reviewOutfitId,
      stars: numericStars,
      ...(comment?.trim() ? {comment: comment.trim()} : {}),
    };

    const review = await addReviewService(reviewData);

    return res.status(201).json(review);
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to add review",
      error: error.message,
    });
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
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to get reviews",
      error: error.message,
    });
  }
};
