/**
 * Protege rutas de vistas: redirige a /login si no hay sesión.
 */
function requireSession(req, res, next) {
    if (!req.session?.user) return res.redirect('/login');
    res.locals.user = req.session.user;
    next();
}

/**
 * Protege rutas de vistas solo para admin.
 */
function requireAdmin(req, res, next) {
    if (!req.session?.user) return res.redirect('/login');
    if (req.session.user.role !== 'admin') return res.redirect('/dashboard');
    res.locals.user = req.session.user;
    next();
}

/**
 * Inyecta el usuario de sesión en res.locals para todas las vistas.
 */
function injectUser(req, res, next) {
    res.locals.user = req.session?.user ?? null;
    next();
}

export { requireSession, requireAdmin, injectUser };
