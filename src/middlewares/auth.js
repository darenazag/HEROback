/**
 * @file Middlewares de autenticación (JWT para API, sesión para Web).
 */
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

/** Genera un JWT para un usuario. */
export function signToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role, username: user.username },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

/** Requiere JWT válido en header Authorization. */
export async function requireApiAuth(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) return res.status(401).json({ error: 'Token requerido' });
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(payload.id);
        if (!user || !user.is_active) return res.status(401).json({ error: 'Usuario inválido' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

/** Restringe por rol (API). */
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'No autenticado' });
        if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Acceso denegado' });
        next();
    };
}

/** Requiere sesión web. */
export function requireWebAuth(req, res, next) {
    if (!req.session?.user) {
        req.flash('error', 'Debes iniciar sesión');
        return res.redirect('/auth/login');
    }
    next();
}

/** Restringe por rol (web). */
export function requireWebRole(...roles) {
    return (req, res, next) => {
        if (!req.session?.user) return res.redirect('/auth/login');
        if (!roles.includes(req.session.user.role)) {
            req.flash('error', 'No tienes permisos para esta acción');
            return res.redirect('/');
        }
        next();
    };
}
