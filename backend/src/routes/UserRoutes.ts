import express from "express";
import {getRentsAndOrdersByUserId} from "../controllers/UserController.js";

const router = express.Router();

router.get("/orders/:id", getRentsAndOrdersByUserId);

export default router;
