import { Router } from 'express';
import { requireSession, requireAdmin } from '../middlewares/sessionMiddleware.js';
import * as authService from '../services/authService.js';
import * as heroService from '../services/heroService.js';
import * as productService from '../services/productService.js';
import * as teamService from '../services/teamService.js';
import * as userService from '../services/userService.js';
import * as adminService from '../services/adminService.js';

const router = Router();

/* ── Públicas ─────────────────────────────────────────── */

router.get('/', async (req, res) => {
    try {
        const { data: heroes } = await heroService.getAll({ page: 1, limit: 12 });
        res.render('index', { heroes });
    } catch (err) {
        res.render('error', { message: err.message });
    }
});

router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.login({ email, password });
        req.session.user = user;
        // Pasa el token a la vista para que app.js lo persista en localStorage
        res.render('token-redirect', { jwtToken: token, redirectTo: '/dashboard' });
    } catch (err) {
        res.render('login', { error: err.message });
    }
});

router.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('register', { error: null });
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        await authService.register({ username, email, password });
        const { user, token } = await authService.login({ email, password });
        req.session.user = user;
        res.render('token-redirect', { jwtToken: token, redirectTo: '/dashboard' });
    } catch (err) {
        res.render('register', { error: err.message });
    }
});

router.get('/heroes', async (req, res) => {
    try {
        const { page = 1, alignment, publisher, search } = req.query;
        const result = await heroService.getAll({ page, limit: 24, alignment, publisher, search });
        res.render('heroes', { ...result, query: req.query });
    } catch (err) {
        res.render('error', { message: err.message });
    }
});

router.get('/heroes/:id', async (req, res) => {
    try {
        const hero = await heroService.getById(req.params.id);
        res.render('hero', { hero });
    } catch (err) {
        res.render('error', { message: err.message });
    }
});

router.get('/store', async (req, res) => {
    try {
        const { data: products } = await productService.getAll();
        res.render('store', { products });
    } catch (err) {
        res.render('error', { message: err.message });
    }
});

/* ── Con sesión ───────────────────────────────────────── */

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

router.get('/dashboard', requireSession, async (req, res) => {
    try {
        const user = await authService.getProfile(req.session.user.id);
        res.render('dashboard', { user });
    } catch (err) {
        res.render('error', { message: err.message });
    }
});

router.get('/perfil', requireSession, async (req, res) => {
    try {
        const user = await authService.getProfile(req.session.user.id);
        res.render('perfil', { user, success: null, error: null });
    } catch (err) {
        res.render('error', { message: err.message });
    }
});

router.post('/perfil', requireSession, async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await userService.update(req.session.user.id, { username, email });
        req.session.user = { ...req.session.user, username: user.username, email: user.email };
        res.render('perfil', { user, success: 'Perfil actualizado correctamente', error: null });
    } catch (err) {
        const user = await authService.getProfile(req.session.user.id);
        res.render('perfil', { user, success: null, error: err.message });
    }
});

router.get('/teams', requireSession, async (req, res) => {
    try {
        const teams = await teamService.getMyTeams(req.session.user.id);
        res.render('teams', { teams });
    } catch (err) {
        res.render('error', { message: err.message });
    }
});

/* ── Admin ────────────────────────────────────────────── */

router.get('/admin', requireAdmin, async (req, res) => {
    try {
        const [users, stats] = await Promise.all([userService.listAll(), adminService.getStats()]);
        res.render('admin', { users, stats });
    } catch (err) {
        res.render('error', { message: err.message });
    }
});

router.post('/admin/users/:id/delete', requireAdmin, async (req, res) => {
    try {
        await userService.remove(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        res.render('error', { message: err.message });
    }
});

export default router;