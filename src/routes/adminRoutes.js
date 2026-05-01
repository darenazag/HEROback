import { Router } from 'express';
import adminController from '../controllers/adminController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/stats', verifyToken, checkRole('admin'), adminController.getStats);

export default router;
