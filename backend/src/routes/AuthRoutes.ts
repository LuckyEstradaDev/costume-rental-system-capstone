import express from "express";
import {
  loginController,
  registerController,
  signOutController,
} from "../controllers/AuthController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/sign-out", signOutController);

export default router;
