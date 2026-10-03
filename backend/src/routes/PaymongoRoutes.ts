import express from 'express'
import { Payment } from '../controllers/PaymongoController.js';
const router = express.Router()

router.get('/', Payment);

export default router;