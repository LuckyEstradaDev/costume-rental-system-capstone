import type {Request, Response} from "express";
import mongoose from "mongoose";
import type {IPackage} from "../interfaces/IPackage.js";
import {
  createPackageService,
  deletePackageService,
  getAllPackagesService,
  getPackageByIdService,
  updatePackageService,
} from "../services/package.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

const getPackageId = (req: Request, res: Response) => {
  const {id} = req.params as {id: string};
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({message: "Invalid package id."});
    return null;
  }
  return id;
};

export const createPackageController = async (req: Request, res: Response) => {
  try {
    const packageData = req.body as Partial<IPackage>;

    const packageItem = await createPackageService(packageData as IPackage);
    return res.status(201).json(packageItem);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to create package.");
  }
};

export const getAllPackagesController = async (req: Request, res: Response) => {
  try {
    const packages = await getAllPackagesService();
    return res.status(200).json(packages);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch packages.");
  }
};

export const getPackageByIdController = async (req: Request, res: Response) => {
  try {
    const id = getPackageId(req, res);
    if (!id) return;

    const packageItem = await getPackageByIdService(id);
    if (!packageItem)
      return res.status(404).json({message: "Package not found."});

    return res.status(200).json(packageItem);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch package by id.");
  }
};

export const updatePackageController = async (req: Request, res: Response) => {
  try {
    const id = getPackageId(req, res);
    if (!id) return;

    const updateData = req.body as Partial<IPackage>;
    if (!Object.keys(updateData).length) {
      return res.status(400).json({message: "Update data is required."});
    }

    const packageItem = await updatePackageService(id, updateData);
    if (!packageItem)
      return res.status(404).json({message: "Package not found."});

    return res.status(200).json(packageItem);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to update package.");
  }
};

export const deletePackageController = async (req: Request, res: Response) => {
  try {
    const id = getPackageId(req, res);
    if (!id) return;

    const packageItem = await deletePackageService(id);
    if (!packageItem)
      return res.status(404).json({message: "Package not found."});

    return res.status(200).json(packageItem);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to delete package.");
  }
};
