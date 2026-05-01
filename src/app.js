/**
 * @file Configuración principal de Express (ESM).
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

import apiRoutes from './routes/api/index.js';
import webRoutes from './routes/web/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { swaggerSpec } from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'change_me_session',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 24 },
    })
);
app.use(flash());

// Variables globales para vistas
app.use((req, res, next) => {
    res.locals.currentUser = req.session?.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Rutas
app.use('/api', apiRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', webRoutes);

// 404 + errores
app.use(notFound);
app.use(errorHandler);

export default app;
