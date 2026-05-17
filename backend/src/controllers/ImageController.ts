import type {Response, Request} from "express";
import {Readable} from "stream";
import cloudinary from "../config/cloudinary.js";
import {HTTPError} from "../utils/HttpError.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

const uploadBufferToCloudinary = (buffer: Buffer) => {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {folder: "costume_rentals"},
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

export const ImageController = async (req: Request, res: Response) => {
  try {
    if (!req.file?.buffer) throw new HTTPError("Missing image file.", 404);
    const result = await uploadBufferToCloudinary(req.file.buffer);

    res.json({
      url: result.secure_url,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to upload image.");
  }
};
