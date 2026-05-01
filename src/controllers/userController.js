/**
 * @file userController.js
 */
import * as userService from '../services/userService.js';

/** GET /api/users — admin */
export async function getAll(req, res) {
    try {
        return res.status(200).json(await userService.getAll(req.queryFeatures));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

/** PATCH /api/users/:id */
export async function update(req, res) {
    try {
        const targetId = Number(req.params.id);
        if (req.user.role !== 'admin' && req.user.id !== targetId)
            return res.status(403).json({ error: 'No puedes editar a otro usuario' });
        return res.status(200).json(await userService.update(targetId, req.body));
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/** DELETE /api/users/:id — admin */
export async function remove(req, res) {
    try {
        await userService.remove(req.params.id);
        return res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
}

export default { getAll, update, remove };
