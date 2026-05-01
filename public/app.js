/**
 * app.js — Script cliente compartido.
 * Persiste el JWT en localStorage cuando el servidor lo devuelve via meta tag,
 * y expone helpers para peticiones autenticadas desde las vistas.
 */

(function () {
    'use strict';

    /* ── Guardar token si el servidor lo envía en un meta tag ── */
    const tokenMeta = document.querySelector('meta[name="jwt-token"]');
    if (tokenMeta && tokenMeta.content) {
        localStorage.setItem('token', tokenMeta.content);
    }

    /* ── Helper global para fetch autenticado ──────────────── */
    window.authFetch = async function (url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(url, { ...options, headers });
    };

    /* ── Logout: limpiar token ─────────────────────────────── */
    const logoutLink = document.querySelector('a[href="/logout"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', () => {
            localStorage.removeItem('token');
        });
    }
})();
