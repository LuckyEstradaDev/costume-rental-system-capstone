import type {Request, Response} from "express";
import {
  createOutfitService,
  deleteOufitService,
  getAllOutfitsService,
  updateOutfitService,
} from "../services/outfit.service.js";

export const createOutfitController = async (req: Request, res: Response) => {
  try {
    await createOutfitService(req.body);
    return res.status(200).json({message: "Outfit created successfully."});
  } catch (error: any) {
    return res.status(500).json({message: error.message});
  }
};

export const getOutfitsController = async (req: Request, res: Response) => {
  try {
    const outfits = await getAllOutfitsService();
    return res.status(200).json(outfits);
  } catch (error: any) {
    return res.status(500).json({message: error.message});
  }
};

export const updateOutfitController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params as {id: string};
    let updateData = req.body.updateData;
    const outfits = await updateOutfitService(id, updateData);
    return res.status(200).json(outfits);
  } catch (error: any) {
    return res.status(500).json({message: error.message});
  }
};

export const deleteOutfitController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params as {id: string};
    const outfits = await deleteOufitService(id);
    return res.status(200).json(outfits);
  } catch (error: any) {
    return res.status(500).json({message: error.message});
  }
};
