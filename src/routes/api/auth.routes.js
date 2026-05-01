/**
 * @file Rutas API de autenticación.
 */
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../../controllers/authController.js';
import { requireApiAuth } from '../../middlewares/auth.js';

const router = Router();

router.post(
    '/register',
    [
        body('username').isLength({ min: 3 }),
        body('email').isEmail(),
        body('password').isLength({ min: 6 }),
    ],
    register
);
router.post('/login', login);
router.get('/me', requireApiAuth, me);

export default router;
