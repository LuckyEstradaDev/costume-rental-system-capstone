import {updateProfileService} from "../services/auth.service.js";
import type {Request, Response} from "express";
import {getAdminService, getUserCount, getCustomerAccount, getCustomerAccounts, setAccountStatus, isStaffAccount} from "../services/admin.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

export const getUserCountController = async (req: Request, res: Response) => {
  try {
    const data = await getUserCount();
    return res
      .status(200)
      .json({message: "User count fetched successfully", data});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch user count.");
  }
};

export const getAdminController = async (req: Request, res: Response) => {
  try {
    const data = await getAdminService();
    return res
      .status(200)
      .json({message: "Admin accounts fetched successfully", data});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch user count.");
  }
};

export const getCustomerAccountsController = async (_req: Request, res: Response) => {
  try {
    return res.json({data: await getCustomerAccounts()});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch customer accounts.");
  }
};

export const getCustomerAccountController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params as {id: string};
    const customer = /^[a-f0-9]{24}$/i.test(id) ? await getCustomerAccount(id) : null;
    if (!customer) return res.status(404).json({message: "Customer account not found."});
    return res.json({data: customer});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch customer account.");
  }
};

export const setAccountStatusController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params as {id: string};
    const {deactivated} = req.body ?? {};
    if (!/^[a-f0-9]{24}$/i.test(id) || typeof deactivated !== "boolean") {
      return res.status(400).json({message: "Invalid account status request."});
    }
    const account = await setAccountStatus(id, deactivated);
    if (!account) return res.status(404).json({message: "Account not found."});
    return res.json({data: account});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to change account status.");
  }
};

export const editStaffController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params as {id: string};
    if (!/^[a-f0-9]{24}$/i.test(id) || !await isStaffAccount(id)) {
      return res.status(404).json({message: "Staff account not found."});
    }
    const {firstName, lastName, phoneNumber, gender, address} = req.body;
    await updateProfileService(id, {firstName, lastName, phoneNumber, gender, address});
    return res.status(204).send();
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to edit staff account.");
  }
};
