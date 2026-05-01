/**
 * @file productRoutes.js
 */
import { Router } from 'express';
import productController from '../controllers/productController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import { queryFeatures } from '../middlewares/queryFeatures.js';

const router = Router();

const FILTERS = ['name', 'price', 'stock'];
const SORTS = ['name', 'price', 'stock', 'created_at'];

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Lista de productos (paginación/filtros/orden)
 *     tags: [Products]
 */
router.get('/', queryFeatures(FILTERS, SORTS), productController.getAll);
router.get('/:id', productController.getById);
router.post('/', verifyToken, checkRole('admin'), productController.create);
router.patch('/:id', verifyToken, checkRole('admin'), productController.update);
router.delete('/:id', verifyToken, checkRole('admin'), productController.remove);

export default router;
