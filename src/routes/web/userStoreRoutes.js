import { Router } from 'express';
import userStoreController from '../controllers/userStoreController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/buy', verifyToken, userStoreController.buyProduct);
router.get('/my-purchases', verifyToken, userStoreController.getMyPurchases);
router.post('/add-hero', verifyToken, userStoreController.addHero);

export default router;
