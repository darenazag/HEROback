/**
 * @file Rutas API de usuarios (admin).
 */
import { Router } from 'express';
import { listUsers, getUser, updateUser, deleteUser } from '../../controllers/userController.js';
import { requireApiAuth, requireRole } from '../../middlewares/auth.js';

const router = Router();
router.use(requireApiAuth, requireRole('admin'));
router.get('/', listUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
export default router;
