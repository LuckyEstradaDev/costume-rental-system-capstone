import type {Response, Request} from "express";
import cloudinary from "../config/cloudinary.js";
import {HTTPError} from "../utils/HttpError.js";

export const ImageController = async (req: Request, res: Response) => {
  try {
    if (!req.file?.path) throw new HTTPError("Missing image file.", 404);
    const result = await cloudinary.uploader.upload(req.file.path);

    res.json({
      url: result.secure_url,
    });
  } catch (error: any) {
    return res.status(500).json({message: error.message});
  }
};
