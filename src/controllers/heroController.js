/**
 * @file heroController.js
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import * as heroService from '../services/heroService.js';
import * as imageProxyService from '../services/imageProxyService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLACEHOLDER_PATH = path.join(__dirname, '..', '..', 'public', 'placeholder.svg');

/**
 * Sirve la imagen del héroe a través de un proxy del servidor.
 * Si la URL externa falla o no existe, devuelve el placeholder.svg.
 *
 * @param {import('express').Request} res
 * @param {import('express').Response} res
 */
async function serveImage(res, hero) {
    const url = hero?.image_url;
    if (url) {
        const proxied = await imageProxyService.fetchImage(url);
        if (proxied) {
            res.set('Content-Type', proxied.contentType);
            res.set('Cache-Control', 'public, max-age=86400, immutable');
            return res.send(proxied.buffer);
        }
    }
    // Fallback: placeholder.svg
    try {
        const svg = await readFile(PLACEHOLDER_PATH);
        res.set('Content-Type', 'image/svg+xml');
        res.set('Cache-Control', 'public, max-age=3600');
        return res.send(svg);
    } catch {
        return res.status(404).end();
    }
}

/** GET /api/heroes/:id/image — proxy de imagen */
export async function getImage(req, res) {
    try {
        const hero = await heroService.getById(req.params.id);
        return serveImage(res, hero);
    } catch {
        // Aunque el héroe no exista, devolvemos el placeholder en vez de 404
        // para que los <img> no aparezcan rotos en cualquier vista.
        return serveImage(res, null);
    }
}

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

export default { getAll, getMyHeroes, getById, getImage, create, update, remove };
