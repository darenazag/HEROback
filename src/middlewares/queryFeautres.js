/**
 * @file queryFeatures.js
 * @description Middleware reutilizable que parsea querystring para
 * paginación, ordenamiento y filtrado avanzado, y deja un objeto
 * `req.queryFeatures` listo para pasar a Sequelize.
 *
 * Sintaxis aceptada en la URL:
 *   ?page=2&limit=10
 *   ?sort=name           (ASC)
 *   ?sort=-created_at    (DESC)
 *   ?<campo>=valor       (igualdad estricta)
 *   ?<campo>__like=foo   (LIKE / iLIKE %foo%)
 *   ?<campo>__gte=10     (>=)
 *   ?<campo>__lte=99     (<=)
 *   ?<campo>__ne=bad     (distinto)
 *
 * @example
 *   router.get('/', queryFeatures(['name','price'], ['name','created_at']),
 *     productController.getAll);
 */
import { Op } from 'sequelize';

const OPERATORS = {
    like: (v) => ({ [Op.iLike]: `%${v}%` }),
    gte: (v) => ({ [Op.gte]: v }),
    lte: (v) => ({ [Op.lte]: v }),
    ne: (v) => ({ [Op.ne]: v }),
};

/**
 * Factory de middleware.
 * @param {string[]} allowedFilterFields  Campos permitidos para filtrar.
 * @param {string[]} allowedSortFields    Campos permitidos para ordenar.
 * @returns {import('express').RequestHandler}
 */
export function queryFeatures(allowedFilterFields = [], allowedSortFields = []) {
    return (req, _res, next) => {
        const { page = 1, limit = 20, sort, ...rest } = req.query;

        /* ── paginación ── */
        const pageN = Math.max(1, parseInt(page, 10) || 1);
        const limitN = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageN - 1) * limitN;

        /* ── ordenamiento ── */
        const order = [];
        if (sort) {
            for (const part of String(sort).split(',')) {
                const dir = part.startsWith('-') ? 'DESC' : 'ASC';
                const field = part.replace(/^[-+]/, '');
                if (allowedSortFields.includes(field)) order.push([field, dir]);
            }
        }

        /* ── filtros ── */
        const where = {};
        for (const [key, raw] of Object.entries(rest)) {
            const [field, opName] = key.split('__');
            if (!allowedFilterFields.includes(field)) continue;
            if (raw === '' || raw == null) continue;
            if (opName && OPERATORS[opName]) {
                where[field] = OPERATORS[opName](raw);
            } else {
                where[field] = raw;
            }
        }

        req.queryFeatures = {
            pagination: { page: pageN, limit: limitN, offset },
            order,
            where,
        };
        next();
    };
}

/**
 * Helper para construir el bloque `pagination` de la respuesta.
 * @param {number} total Resultado de findAndCountAll().count
 * @param {{ page:number, limit:number }} pag
 */
export function buildPagination(total, { page, limit }) {
    return {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
    };
}
