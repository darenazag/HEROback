/**
 * @file heroRoutes.js
 * @description Endpoints REST de héroes.
 */
import { Router } from 'express';
import heroController from '../controllers/heroController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';
import { queryFeatures } from '../middlewares/queryFeatures.js';

const router = Router();

const HERO_FILTERS = ['name', 'alignment', 'publisher', 'intelligence', 'strength', 'speed'];
const HERO_SORTS = ['name', 'intelligence', 'strength', 'speed', 'durability', 'power', 'combat', 'created_at'];

/**
 * @openapi
 * /api/heroes:
 *   get:
 *     summary: Lista paginada de héroes con filtros y orden
 *     tags: [Heroes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: sort
 *         description: "Campo de orden. Prefijo `-` para DESC. Ej: `-strength`"
 *         schema: { type: string }
 *       - in: query
 *         name: name__like
 *         schema: { type: string }
 *       - in: query
 *         name: alignment
 *         schema: { type: string, enum: [good, bad, neutral, unknown] }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', queryFeatures(HERO_FILTERS, HERO_SORTS), heroController.getAll);

router.get('/mis-heroes', verifyToken, heroController.getMyHeroes);
router.get('/:id/image', heroController.getImage);
router.get('/:id', heroController.getById);

/**
 * @openapi
 * /api/heroes:
 *   post:
 *     summary: Crea un héroe (sólo admin)
 *     tags: [Heroes]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Creado }
 *       403: { description: Sin permisos }
 */
router.post('/', verifyToken, checkRole('admin'), heroController.create);
router.patch('/:id', verifyToken, checkRole('admin'), heroController.update);
router.delete('/:id', verifyToken, checkRole('admin'), heroController.remove);

export default router;
