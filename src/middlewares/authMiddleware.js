import jwt from 'jsonwebtoken';

/**
 * Verifica el JWT en el header Authorization.
 * Si es válido, adjunta el payload en req.user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function verifyToken(req, res, next) {
    const header = req.headers['authorization'];
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token requerido' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
}

/**
 * Factory que comprueba si req.user tiene el rol indicado.
 * Usar siempre DESPUÉS de verifyToken.
 * @param {'admin'|'user'} role
 * @returns {import('express').RequestHandler}
 */
function checkRole(role) {
    return (req, res, next) => {
        if (req.user?.role !== role) {
            return res.status(403).json({ error: 'Acceso denegado: permisos insuficientes' });
        }
        next();
    };
}

export { verifyToken, checkRole };