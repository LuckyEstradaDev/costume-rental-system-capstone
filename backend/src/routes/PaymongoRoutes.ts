import express from 'express'
import { Payment } from '../controllers/PaymongoController.js';
const router = express.Router()

router.post('/', Payment);

export default router;