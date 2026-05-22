import express from "express";
import {getUserCountController} from "../controllers/AdminController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
const router = express.Router();

router.get("/user-count", getUserCountController);
export default router;
