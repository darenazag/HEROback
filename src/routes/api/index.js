/**
 * @file Aggregator de rutas API.
 */
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import heroRoutes from './heroes.routes.js';
import commentRoutes from './comments.routes.js';
import userRoutes from './users.routes.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/heroes', heroRoutes);
router.use('/comments', commentRoutes);
router.use('/users', userRoutes);

router.get('/health', (req, res) => res.json({ status: 'ok', service: 'HEROback' }));
export default router;
