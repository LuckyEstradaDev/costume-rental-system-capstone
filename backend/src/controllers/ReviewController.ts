import type {Request, Response} from "express";
import {
  addReviewService,
  getReviewsByOutfitIdService,
} from "../services/review.service.js";

export const addReviewController = async (req: Request, res: Response) => {
  try {
    const review = await addReviewService(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({message: "Failed to add review", error});
  }
};

export const getReviewsByOutfitIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {outfitID} = req.params as {outfitID: string};
    const reviews = await getReviewsByOutfitIdService(outfitID);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({message: "Failed to get reviews", error});
  }
};
