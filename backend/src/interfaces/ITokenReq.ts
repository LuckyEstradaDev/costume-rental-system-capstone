import type {Request} from "express";

export interface ITokenRequest extends Request {
  user?: any;
}
