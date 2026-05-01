/**
 * @file Rutas API de comentarios.
 */
import { Router } from 'express';
import { deleteComment } from '../../controllers/commentController.js';
import { requireApiAuth } from '../../middlewares/auth.js';

const router = Router();
router.delete('/:id', requireApiAuth, deleteComment);
export default router;
