import { Router } from 'express';
import teamController from '../controllers/teamController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, teamController.getMyTeams);
router.post('/', verifyToken, teamController.create);
router.patch('/:id', verifyToken, teamController.update);
router.delete('/:id', verifyToken, teamController.remove);

export default router;
