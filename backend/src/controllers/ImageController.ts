import type {Response, Request} from "express";
import {Readable} from "stream";
import cloudinary from "../config/cloudinary.js";
import {HTTPError} from "../utils/HttpError.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

type UploadOptions = {
  resourceType?: "image" | "raw";
  folder?: string;
  publicId?: string;
};

const uploadBufferToCloudinary = (
  buffer: Buffer,
  {
    resourceType = "image",
    folder = "costume_rentals",
    publicId,
  }: UploadOptions = {},
) => {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
        ...(publicId ? {public_id: publicId} : {}),
      },
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

export const ModelController = async (req: Request, res: Response) => {
  try {
    if (!req.file?.buffer) throw new HTTPError("Missing model file.", 404);

    const originalName = req.file.originalname ?? "";
    if (!originalName.toLowerCase().endsWith(".glb")) {
      throw new HTTPError("Only .glb files are allowed.", 400);
    }

    // A GLB is not an image, so it is uploaded as a raw asset and delivered
    // untouched. Raw uploads keep the extension in the public id, which is what
    // keeps it on the returned URL.
    const baseName =
      originalName
        .replace(/\.glb$/i, "")
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .slice(0, 60) || "model";

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      resourceType: "raw",
      folder: "costume_rentals/models",
      publicId: `${baseName}-${Date.now()}.glb`,
    });

    res.json({
      url: result.secure_url,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to upload model.");
  }
};
