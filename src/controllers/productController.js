/**
 * @file productController.js
 */
import * as productService from '../services/productService.js';

/** GET /api/products */
export async function getAll(req, res) {
    try {
        return res.status(200).json(await productService.getAll(req.queryFeatures));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

/** GET /api/products/:id */
export async function getById(req, res) {
    try {
        return res.status(200).json(await productService.getById(req.params.id));
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
}

/** POST /api/products — admin */
export async function create(req, res) {
    try {
        const { name, description, price, stock, image_url } = req.body;
        if (!name || !price)
            return res.status(400).json({ error: 'name y price son obligatorios' });
        return res
            .status(201)
            .json(await productService.create({ name, description, price, stock, image_url }));
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/** PATCH /api/products/:id — admin */
export async function update(req, res) {
    try {
        return res.status(200).json(await productService.update(req.params.id, req.body));
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/** DELETE /api/products/:id — admin */
export async function remove(req, res) {
    try {
        await productService.remove(req.params.id);
        return res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
}

export default { getAll, getById, create, update, remove };
