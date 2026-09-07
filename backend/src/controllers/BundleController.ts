import type {Request, Response} from "express";
import mongoose from "mongoose";
import type {IBundle} from "../interfaces/IBundle.js";
import {
  createBundleService,
  deleteBundleService,
  getAllBundlesService,
  getBundleByIdService,
  updateBundleService,
} from "../services/bundle.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

const getBundleId = (req: Request, res: Response) => {
  const {id} = req.params as {id: string};
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({message: "Invalid bundle id."});
    return null;
  }
  return id;
};

export const createBundleController = async (req: Request, res: Response) => {
  try {
    const bundleData = req.body as Partial<IBundle>;

    const bundle = await createBundleService(bundleData as IBundle);
    return res.status(201).json(bundle);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to create bundle.");
  }
};

export const getAllBundlesController = async (req: Request, res: Response) => {
  try {
    const bundles = await getAllBundlesService();
    return res.status(200).json(bundles);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch bundles.");
  }
};

export const getBundleByIdController = async (req: Request, res: Response) => {
  try {
    const id = getBundleId(req, res);
    if (!id) return;

    const bundle = await getBundleByIdService(id);
    if (!bundle) return res.status(404).json({message: "Bundle not found."});

    return res.status(200).json(bundle);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch bundle by id.");
  }
};

export const updateBundleController = async (req: Request, res: Response) => {
  try {
    const id = getBundleId(req, res);
    if (!id) return;

    const updateData = req.body as Partial<IBundle>;
    if (!Object.keys(updateData).length) {
      return res.status(400).json({message: "Update data is required."});
    }

    const bundle = await updateBundleService(id, updateData);
    if (!bundle) return res.status(404).json({message: "Bundle not found."});

    return res.status(200).json(bundle);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to update bundle.");
  }
};

export const deleteBundleController = async (req: Request, res: Response) => {
  try {
    const id = getBundleId(req, res);
    if (!id) return;

    const bundle = await deleteBundleService(id);
    if (!bundle) return res.status(404).json({message: "Bundle not found."});

    return res.status(200).json(bundle);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to delete bundle.");
  }
};
