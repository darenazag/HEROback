/**
 * @file heroController.js
 */
import * as heroService from '../services/heroService.js';

/** GET /api/heroes — soporta ?page&limit&sort&name__like&alignment&publisher__like */
export async function getAll(req, res) {
    try {
        return res.status(200).json(await heroService.getAll(req.queryFeatures));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

/** GET /api/heroes/mis-heroes */
export async function getMyHeroes(req, res) {
    try {
        return res.status(200).json(await heroService.getMyHeroes(req.user.id));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

/** GET /api/heroes/:id */
export async function getById(req, res) {
    try {
        return res.status(200).json(await heroService.getById(req.params.id));
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
}

/** POST /api/heroes — admin */
export async function create(req, res) {
    try {
        return res.status(201).json(await heroService.create(req.body));
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/** PATCH /api/heroes/:id — admin */
export async function update(req, res) {
    try {
        return res.status(200).json(await heroService.update(req.params.id, req.body));
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/** DELETE /api/heroes/:id — admin */
export async function remove(req, res) {
    try {
        await heroService.remove(req.params.id);
        return res.status(200).json({ message: 'Héroe eliminado correctamente' });
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
}

export default { getAll, getMyHeroes, getById, create, update, remove };
