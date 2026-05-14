import { Team, TeamHero, UserHero, Hero } from '../models/index.js';

const MAX_HEROES_PER_TEAM = 6;

/** @param {number} userId @returns {Promise<Team[]>} */
export async function getMyTeams(userId) {
    const teams = await Team.findAll({
        where: { user_id: userId },
        include: [{ model: TeamHero, include: [{ model: UserHero, include: [{ model: Hero }] }] }],
        order: [['created_at', 'DESC']],
    });
    // Normaliza a objetos planos y garantiza que TeamHeroes siempre sea un array
    return teams.map((t) => {
        const plain = t.get({ plain: true });
        plain.TeamHeroes = Array.isArray(plain.TeamHeroes) ? plain.TeamHeroes : [];
        // Ordena por posición para que la UI no dependa del orden de la BD
        plain.TeamHeroes.sort((a, b) => (a.position || 0) - (b.position || 0));
        return plain;
    });
}

/**
 * Comprueba que el equipo pertenece al usuario y lo devuelve.
 * @param {number} teamId
 * @param {number} userId
 * @returns {Promise<Team>}
 */
async function getOwnedTeamOrThrow(teamId, userId) {
    const team = await Team.findOne({ where: { id: teamId, user_id: userId } });
    if (!team) throw new Error('Equipo no encontrado o sin permisos');
    return team;
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
    const team = await getOwnedTeamOrThrow(teamId, userId);

    if (name) await team.update({ name });

    if (Array.isArray(heroIds)) {
        if (heroIds.length > MAX_HEROES_PER_TEAM) {
            throw new Error(`Máximo ${MAX_HEROES_PER_TEAM} héroes por equipo`);
        }
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
 * Añade un héroe (de la colección del usuario) al equipo.
 * Calcula automáticamente la primera posición libre (1..6).
 *
 * @param {number} teamId
 * @param {number} userId
 * @param {number} userHeroId  ID de la fila user_heroes (no el hero_id).
 * @returns {Promise<TeamHero>}
 */
export async function addHero(teamId, userId, userHeroId) {
    await getOwnedTeamOrThrow(teamId, userId);

    // Verifica que el user_hero realmente sea del usuario.
    const userHero = await UserHero.findOne({ where: { id: userHeroId, user_id: userId } });
    if (!userHero) throw new Error('Ese héroe no está en tu colección');

    // ¿Ya está en el equipo?
    const existing = await TeamHero.findOne({ where: { team_id: teamId, user_hero_id: userHeroId } });
    if (existing) throw new Error('Ese héroe ya forma parte del equipo');

    const current = await TeamHero.findAll({ where: { team_id: teamId } });
    if (current.length >= MAX_HEROES_PER_TEAM) {
        throw new Error(`Máximo ${MAX_HEROES_PER_TEAM} héroes por equipo`);
    }

    // Primer slot libre entre 1..MAX
    const taken = new Set(current.map((t) => t.position));
    let position = 1;
    while (taken.has(position) && position <= MAX_HEROES_PER_TEAM) position++;

    return TeamHero.create({ team_id: teamId, user_hero_id: userHeroId, position });
}

/**
 * Elimina un héroe del equipo.
 *
 * @param {number} teamId
 * @param {number} userId
 * @param {number} userHeroId
 */
export async function removeHero(teamId, userId, userHeroId) {
    await getOwnedTeamOrThrow(teamId, userId);
    const deleted = await TeamHero.destroy({
        where: { team_id: teamId, user_hero_id: userHeroId },
    });
    if (!deleted) throw new Error('Ese héroe no está en el equipo');
}

/**
 * Elimina un equipo (solo el propietario).
 * @param {number} teamId
 * @param {number} userId
 */
export async function remove(teamId, userId) {
    const team = await getOwnedTeamOrThrow(teamId, userId);
    await team.destroy();
}

export default { getMyTeams, create, update, addHero, removeHero, remove };