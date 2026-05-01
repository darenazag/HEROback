/**
 * @file Controlador de comentarios.
 */
import { Comment, User } from '../models/index.js';

/**
 * @swagger
 * /api/heroes/{heroId}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Crea un comentario sobre un héroe
 */
export async function createComment(req, res, next) {
    try {
        const heroId = parseInt(req.params.heroId);
        const { content, rating } = req.body;
        const c = await Comment.create({ user_id: req.user.id, hero_id: heroId, content, rating });
        res.status(201).json(c);
    } catch (err) { next(err); }
}

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: Elimina un comentario propio (o admin)
 */
export async function deleteComment(req, res, next) {
    try {
        const c = await Comment.findByPk(req.params.id);
        if (!c) return res.status(404).json({ error: 'No encontrado' });
        if (c.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        await c.destroy();
        res.status(204).end();
    } catch (err) { next(err); }
}

export async function listCommentsByHero(req, res, next) {
    try {
        const rows = await Comment.findAll({
            where: { hero_id: req.params.heroId },
            include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
            order: [['created_at', 'DESC']],
        });
        res.json(rows);
    } catch (err) { next(err); }
}
