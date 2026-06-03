import type {Request, Response} from "express";
import {
  createOutfitService,
  deleteOufitService,
  getAllOutfitsService,
  getOutfitByIdService,
  getOutfitStatsService,
  updateOutfitService,
} from "../services/outfit.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

export const createOutfitController = async (req: Request, res: Response) => {
  try {
    await createOutfitService(req.body);
    return res.status(200).json({message: "Outfit created successfully."});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to create outfit.");
  }
};

export const getOutfitsController = async (req: Request, res: Response) => {
  try {
    const outfits = await getAllOutfitsService();
    return res.status(200).json(outfits);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch outfits.");
  }
};

export const getOutfitByIdController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params as {id: string};
    const outfit = await getOutfitByIdService(id);
    return res.status(200).json(outfit);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch outfit by id.");
  }
};

export const updateOutfitController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params as {id: string};
    const updateData = req.body;
    const outfits = await updateOutfitService(id, updateData);
    return res.status(200).json(outfits);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to update outfit.");
  }
};

export const deleteOutfitController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params as {id: string};
    const outfits = await deleteOufitService(id);
    return res.status(200).json(outfits);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to delete outfit.");
  }
};

export const getOutfitStatsController = async (req: Request, res: Response) => {
  try {
    const stats = await getOutfitStatsService();
    return res.status(200).json(stats);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch outfit stats.");
  }
};
