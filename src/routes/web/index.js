/**
 * @file Rutas web (Pug).
 */
import { Router } from 'express';
import {
    webList, webDetail, webNewForm, webEditForm, webCreate, webUpdate, webDelete,
} from '../../controllers/heroController.js';
import { webLogin, webRegister, webLogout } from '../../controllers/authController.js';
import { webListUsers } from '../../controllers/userController.js';
import { requireWebAuth, requireWebRole } from '../../middlewares/auth.js';

const router = Router();

router.get('/', (req, res) => res.render('home', { title: 'HEROback' }));

router.get('/auth/login', (req, res) => res.render('auth/login', { title: 'Iniciar sesión' }));
router.post('/auth/login', webLogin);
router.get('/auth/register', (req, res) => res.render('auth/register', { title: 'Registro' }));
router.post('/auth/register', webRegister);
router.get('/auth/logout', webLogout);

router.get('/heroes', webList);
router.get('/heroes/new', requireWebAuth, requireWebRole('admin'), webNewForm);
router.post('/heroes', requireWebAuth, requireWebRole('admin'), webCreate);
router.get('/heroes/:id', webDetail);
router.get('/heroes/:id/edit', requireWebAuth, requireWebRole('admin'), webEditForm);
router.put('/heroes/:id', requireWebAuth, requireWebRole('admin'), webUpdate);
router.delete('/heroes/:id', requireWebAuth, requireWebRole('admin'), webDelete);

router.get('/users', requireWebAuth, requireWebRole('admin'), webListUsers);

export default router;
