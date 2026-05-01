import { User, Hero, Product, UserHero } from '../models/index.js';

/**
 * Estadísticas generales para el panel de administración.
 * @returns {Promise<object>}
 */
export async function getStats() {
    const [totalUsers, totalHeroes, totalProducts, totalCollections] = await Promise.all([
        User.count(), Hero.count(), Product.count(), UserHero.count(),
    ]);
    return { totalUsers, totalHeroes, totalProducts, totalCollections };
}

export default { getStats };
