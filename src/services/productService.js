/**
 * @file productService.js
 * @description Lógica de negocio de productos. Soporta paginación,
 * filtros y ordenamiento mediante el objeto `queryFeatures`.
 */
import { Product } from '../models/index.js';
import { buildPagination } from '../middlewares/queryFeatures.js';

/**
 * Lista de productos con paginación/filtros/orden.
 * @param {object} qf req.queryFeatures
 * @returns {Promise<{ data: Product[], pagination: object }>}
 */
export async function getAll(qf = {}) {
    const { pagination = { page: 1, limit: 20, offset: 0 }, order = [], where = {} } = qf;
    const { count, rows } = await Product.findAndCountAll({
        where,
        order: order.length ? order : [['name', 'ASC']],
        limit: pagination.limit,
        offset: pagination.offset,
    });
    return { data: rows, pagination: buildPagination(count, pagination) };
}

/** @param {number} id */
export async function getById(id) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
}

/** @param {object} data */
export async function create(data) {
    return Product.create(data);
}

/** @param {number} id @param {object} data */
export async function update(id, data) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error('Producto no encontrado');
    return product.update(data);
}

/** @param {number} id */
export async function remove(id) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error('Producto no encontrado');
    await product.destroy();
}

export default { getAll, getById, create, update, remove };
