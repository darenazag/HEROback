/**
 * @file Configuración principal de Express (ESM).
 * Monta API REST + vistas Pug, sesiones, flash y Swagger.
 */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import swaggerUi from 'swagger-ui-express';

import apiRoutes from './routes/index.js';
import viewRoutes from './routes/viewRoutes.js';
import { injectUser } from './middlewares/sessionMiddleware.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { swaggerSpec } from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const app = express();

// View engine Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middlewares globales
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Estáticos desde la carpeta /public en la raíz del proyecto
app.use(express.static(path.join(projectRoot, 'public')));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'change_me_session',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 24 },
    })
);
app.use(flash());

// Variables globales para vistas (user en navbar, mensajes flash, etc.)
app.use(injectUser);
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Documentación API
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas API (REST con JWT)
app.use('/api', apiRoutes);

// Rutas web (vistas Pug con sesión)
app.use('/', viewRoutes);

// 404 + errores
app.use(notFound);
app.use(errorHandler);

export default app;