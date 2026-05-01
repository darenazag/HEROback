/**
 * @file heroService.js
 * @description Lógica de negocio de héroes.
 */
import { Op } from 'sequelize';
import { Hero, UserHero } from '../models/index.js';
import { buildPagination } from '../middlewares/queryFeatures.js';

/**
 * Lista paginada de héroes.
 * Acepta `queryFeatures` (API) o un objeto simple `{ page, limit, alignment, publisher, search }` (vistas).
 */
export async function getAll(input = {}) {
    let pagination, order, where;

    if (input.pagination) {
        // viene del middleware queryFeatures
        ({ pagination, order, where } = input);
    } else {
        // llamada directa desde vistas
        const page = Math.max(1, Number(input.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(input.limit) || 20));
        pagination = { page, limit, offset: (page - 1) * limit };
        order = [['name', 'ASC']];
        where = {};
        if (input.alignment) where.alignment = input.alignment;
        if (input.publisher) where.publisher = { [Op.iLike]: `%${input.publisher}%` };
        if (input.search) where.name = { [Op.iLike]: `%${input.search}%` };
    }

    const { count, rows } = await Hero.findAndCountAll({
        where,
        order: order.length ? order : [['name', 'ASC']],
        limit: pagination.limit,
        offset: pagination.offset,
    });

    return { data: rows, pagination: buildPagination(count, pagination) };
}

export async function getById(id) {
    const hero = await Hero.findByPk(id);
    if (!hero) throw new Error('Héroe no encontrado');
    return hero;
}

export async function create(data) {
    return Hero.create(data);
}

export async function update(id, data) {
    const hero = await Hero.findByPk(id);
    if (!hero) throw new Error('Héroe no encontrado');
    return hero.update(data);
}

export async function remove(id) {
    const hero = await Hero.findByPk(id);
    if (!hero) throw new Error('Héroe no encontrado');
    await hero.destroy();
}

export async function getMyHeroes(userId) {
    return UserHero.findAll({
        where: { user_id: userId },
        include: [{ model: Hero }],
        order: [['acquired_at', 'DESC']],
    });
}

export default { getAll, getById, create, update, remove, getMyHeroes };
