import { Team, TeamHero, UserHero, Hero } from '../models/index.js';

/** @param {number} userId @returns {Promise<Team[]>} */
export async function getMyTeams(userId) {
    return Team.findAll({
        where: { user_id: userId },
        include: [{ model: TeamHero, include: [{ model: UserHero, include: [{ model: Hero }] }] }],
        order: [['created_at', 'DESC']],
    });
}

/**
 * Crea un equipo nuevo.
 * @param {number} userId
 * @param {string} name
 * @returns {Promise<Team>}
 */
export async function create(userId, name) {
    return Team.create({ user_id: userId, name });
}

/**
 * Actualiza nombre o héroes de un equipo (solo el propietario).
 * @param {number} teamId
 * @param {number} userId
 * @param {{ name?:string, heroIds?:number[] }} data
 * @returns {Promise<Team>}
 */
export async function update(teamId, userId, { name, heroIds }) {
    const team = await Team.findOne({ where: { id: teamId, user_id: userId } });
    if (!team) throw new Error('Equipo no encontrado o sin permisos');

    if (name) await team.update({ name });

    if (Array.isArray(heroIds)) {
        if (heroIds.length > 6) throw new Error('Máximo 6 héroes por equipo');
        const owned = await UserHero.findAll({ where: { id: heroIds, user_id: userId } });
        if (owned.length !== heroIds.length) throw new Error('Algunos héroes no están en tu colección');

        await TeamHero.destroy({ where: { team_id: teamId } });
        await TeamHero.bulkCreate(
            heroIds.map((uhId, i) => ({ team_id: teamId, user_hero_id: uhId, position: i + 1 }))
        );
    }

    return Team.findByPk(teamId, {
        include: [{ model: TeamHero, include: [{ model: UserHero, include: [{ model: Hero }] }] }],
    });
}

/**
 * Elimina un equipo (solo el propietario).
 * @param {number} teamId
 * @param {number} userId
 */
export async function remove(teamId, userId) {
    const team = await Team.findOne({ where: { id: teamId, user_id: userId } });
    if (!team) throw new Error('Equipo no encontrado o sin permisos');
    await team.destroy();
}

export default { getMyTeams, create, update, remove };