/**
 * @file userService.js
 */
import { User } from '../models/index.js';
import { buildPagination } from '../middlewares/queryFeatures.js';

/**
 * Lista de usuarios con paginación/filtros/orden (solo admin).
 */
export async function getAll(qf = {}) {
    const { pagination = { page: 1, limit: 20, offset: 0 }, order = [], where = {} } = qf;
    const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password_hash'] },
        order: order.length ? order : [['created_at', 'DESC']],
        limit: pagination.limit,
        offset: pagination.offset,
    });
    return { data: rows, pagination: buildPagination(count, pagination) };
}

/**
 * Atajo sin paginación (para vistas internas).
 */
export async function listAll() {
    return User.findAll({
        attributes: { exclude: ['password_hash'] },
        order: [['created_at', 'DESC']],
    });
}

/**
 * Actualiza datos del perfil.
 */
export async function update(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');
    const allowed = {};
    if (data.username) allowed.username = data.username;
    if (data.email) allowed.email = data.email;
    return user.update(allowed);
}

/** Elimina un usuario (solo admin). */
export async function remove(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');
    await user.destroy();
}

export default { getAll, listAll, update, remove };
