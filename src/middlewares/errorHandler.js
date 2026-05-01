/**
 * @file Manejo centralizado de errores.
 */

/** 404 handler. */
export function notFound(req, res, next) {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    res.status(404).render('error', { title: '404', message: 'Página no encontrada', status: 404 });
}

/** Error handler global. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
    console.error('[ERROR]', err);
    const status = err.status || 500;
    if (req.originalUrl.startsWith('/api')) {
        return res.status(status).json({ error: err.message || 'Error interno', details: err.errors });
    }
    res.status(status).render('error', {
        title: 'Error',
        message: err.message || 'Error interno',
        status,
    });
}
