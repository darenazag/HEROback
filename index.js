/**
 * @file index.js
 * @description Punto de entrada de HEROback. Configura Express, motor Pug,
 * sesiones, parsers, rutas API y rutas de vistas, y arranca el servidor
 * tras sincronizar Sequelize con PostgreSQL.
 */
import 'dotenv/config';

import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import { sequelize } from './src/models/index.js';
import { injectUser } from './src/middlewares/sessionMiddleware.js';
import apiRouter from './src/routes/index.js';
import viewRouter from './src/routes/viewRoutes.js';
import { swaggerUi, swaggerSpec } from './src/config/swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

/* ── View engine ───────────────────────────────────────── */
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'src/views'));

/* ── Static files ──────────────────────────────────────── */
app.use(express.static(path.join(__dirname, 'public')));

/* ── Body parsers ──────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Session ───────────────────────────────────────────── */
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'heroback-dev-secret-change-me',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
        },
    })
);

/* ── Inyectar usuario en todas las vistas ─────────────── */
app.use(injectUser);

/* ── Documentación API (Swagger) ──────────────────────── */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

/* ── Rutas API ─────────────────────────────────────────── */
app.use('/api', apiRouter);

/* ── Rutas vistas ──────────────────────────────────────── */
app.use('/', viewRouter);

/* ── 404 ───────────────────────────────────────────────── */
app.use((req, res) => {
    if (req.path.startsWith('/api'))
        return res.status(404).json({ error: 'Ruta no encontrada' });
    res.status(404).render('error', { message: 'Página no encontrada (404)' });
});

/* ── Error global ──────────────────────────────────────── */
app.use((err, req, res, _next) => {
    console.error('[ERROR]', err.stack || err.message);
    if (req.path.startsWith('/api'))
        return res.status(500).json({ error: 'Error interno del servidor' });
    res.status(500).render('error', { message: err.message });
});

/* ── Arranque ──────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;

sequelize
    .sync({ alter: false })
    .then(() => {
        console.log('✅ Base de datos sincronizada');
        app.listen(PORT, () => {
            console.log(`🚀 HEROback corriendo en http://localhost:${PORT}`);
            console.log(`📘 Swagger UI:        http://localhost:${PORT}/api/docs`);
        });
    })
    .catch((err) => {
        console.error('❌ Error al conectar con la BD:', err.message);
        process.exit(1);
    });
