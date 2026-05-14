import * as teamService from '../services/teamService.js';

/** GET /api/teams */
export async function getMyTeams(req, res) {
    try {
        return res.status(200).json(await teamService.getMyTeams(req.user.id));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

/** POST /api/teams */
export async function create(req, res) {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'El nombre del equipo es obligatorio' });
        return res.status(201).json(await teamService.create(req.user.id, name));
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/** PATCH /api/teams/:id */
export async function update(req, res) {
    try {
        return res.status(200).json(await teamService.update(req.params.id, req.user.id, req.body));
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/** POST /api/teams/:id/heroes  body: { userHeroId } */
export async function addHero(req, res) {
    try {
        const { userHeroId } = req.body;
        if (!userHeroId) return res.status(400).json({ error: 'userHeroId es obligatorio' });
        const teamHero = await teamService.addHero(
            req.params.id,
            req.user.id,
            Number(userHeroId),
        );
        return res.status(201).json({ message: 'Héroe añadido al equipo', teamHero });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/** DELETE /api/teams/:id/heroes/:userHeroId */
export async function removeHero(req, res) {
    try {
        await teamService.removeHero(
            req.params.id,
            req.user.id,
            Number(req.params.userHeroId),
        );
        return res.status(200).json({ message: 'Héroe eliminado del equipo' });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/** DELETE /api/teams/:id */
export async function remove(req, res) {
    try {
        await teamService.remove(req.params.id, req.user.id);
        return res.status(200).json({ message: 'Equipo eliminado correctamente' });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export const functions = { getMyTeams, create, update, addHero, removeHero, remove };

export default functions;