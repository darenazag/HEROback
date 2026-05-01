/**
 * @file Rutas API de héroes.
 */
import { Router } from 'express';
import {
    listHeroes, getHero, createHero, updateHero, deleteHero,
} from '../../controllers/heroController.js';
import { listCommentsByHero, createComment } from '../../controllers/commentController.js';
import { requireApiAuth, requireRole } from '../../middlewares/auth.js';

const router = Router();

router.get('/', listHeroes);
router.get('/:id', getHero);
router.post('/', requireApiAuth, requireRole('admin'), createHero);
router.put('/:id', requireApiAuth, requireRole('admin'), updateHero);
router.delete('/:id', requireApiAuth, requireRole('admin'), deleteHero);

router.get('/:heroId/comments', listCommentsByHero);
router.post('/:heroId/comments', requireApiAuth, createComment);

export default router;
