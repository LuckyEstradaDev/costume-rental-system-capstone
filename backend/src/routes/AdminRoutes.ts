import express from "express";
import {
  getAdminController,
  getCustomerAccountsController,
  getCustomerAccountController,
  setAccountStatusController,
  editStaffController,
  getUserCountController,
} from "../controllers/AdminController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
import {requireAccountRole} from "../middleware/requireAccountRole.js";
const router = express.Router();

router.get("/user-count", getUserCountController);
const adminOnly = [authenticateToken, requireAccountRole("admin")];
router.get("/admin-accounts", ...adminOnly, getAdminController);
router.get("/customer-accounts", ...adminOnly, getCustomerAccountsController);
router.get("/customer-accounts/:id", ...adminOnly, getCustomerAccountController);
router.patch("/accounts/:id/status", ...adminOnly, setAccountStatusController);
router.patch("/staff-accounts/:id", ...adminOnly, editStaffController);
export default router;
