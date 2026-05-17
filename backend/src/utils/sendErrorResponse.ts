import type {Response} from "express";

type ErrorWithDetails = {
  status?: number;
  message?: string;
  name?: string;
  errors?: unknown;
  code?: number | string;
};

export const sendErrorResponse = (
  res: Response,
  error: unknown,
  fallbackMessage: string,
) => {
  const err = error as ErrorWithDetails;
  const status = err.status || 500;
  const errorMessage =
    err.message || (typeof error === "string" ? error : fallbackMessage);

  return res.status(status).json({
    message: fallbackMessage,
    error: errorMessage,
    status,
    ...(err.name ? {name: err.name} : {}),
    ...(err.code ? {code: err.code} : {}),
    ...(err.errors ? {details: err.errors} : {}),
  });
};
