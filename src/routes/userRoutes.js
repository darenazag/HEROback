/**
 * @file userRoutes.js
 */
import { Router } from 'express';
import userController from '../controllers/userController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import { queryFeatures } from '../middlewares/queryFeatures.js';

const router = Router();

const FILTERS = ['username', 'email', 'role'];
const SORTS = ['username', 'email', 'created_at', 'coins'];

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Lista de usuarios (sólo admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', verifyToken, checkRole('admin'),
    queryFeatures(FILTERS, SORTS), userController.getAll);

router.patch('/:id', verifyToken, userController.update);
router.delete('/:id', verifyToken, checkRole('admin'), userController.remove);

export default router;
