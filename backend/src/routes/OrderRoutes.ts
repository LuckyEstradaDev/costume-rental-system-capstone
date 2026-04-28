import {createOrderController} from "../controllers/OrderController.js";
import express from "express";

const router = express.Router();

router.post("/create", createOrderController);

export default router;
