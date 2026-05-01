import { Router } from 'express';
import authRoutes from './authRoutes.js';
import heroRoutes from './heroRoutes.js';
import productRoutes from './productRoutes.js';
import userStoreRoutes from './userStoreRoutes.js';
import teamRoutes from './teamRoutes.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/heroes', heroRoutes);
router.use('/products', productRoutes);
router.use('/store', userStoreRoutes);
router.use('/teams', teamRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
