import express from "express";
import {
  authenticateUserController,
  loginController,
  registerController,
  signOutController,
  updateProfileController,
  markNotificationReadController,
} from "../controllers/AuthController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authenticateToken, authenticateUserController);
router.patch("/me", authenticateToken, updateProfileController);
router.patch(
  "/me/notifications/:notificationId/read",
  authenticateToken,
  markNotificationReadController,
);
router.post("/sign-out", signOutController);

export default router;
