import { sequelize, User, Product, UserProduct, UserHero } from '../models/index.js';

/**
 * Procesa la compra de un producto descontando coins al usuario.
 * Toda la operación se ejecuta en una transacción SQL atómica.
 *
 * @param {number} userId
 * @param {number} productId
 * @param {number} quantity
 * @returns {Promise<{ user:object, product:Product, purchase:UserProduct }>}
 */
export async function buyProduct(userId, productId, quantity = 1) {
    return sequelize.transaction(async (t) => {
        const user = await User.findByPk(userId, { transaction: t, lock: true });
        const product = await Product.findByPk(productId, { transaction: t, lock: true });

        if (!product) throw new Error('Producto no encontrado');
        if (product.stock < quantity) throw new Error('Stock insuficiente');

        const totalCost = product.price * quantity;
        if (user.coins < totalCost)
            throw new Error(`Coins insuficientes. Necesitas ${totalCost}, tienes ${user.coins}`);

        await user.update({ coins: user.coins - totalCost }, { transaction: t });
        await product.update({ stock: product.stock - quantity }, { transaction: t });

        const purchase = await UserProduct.create(
            { user_id: userId, product_id: productId, quantity },
            { transaction: t }
        );

        return { user: { id: user.id, coins: user.coins - totalCost }, product, purchase };
    });
}

/**
 * Historial de compras de un usuario.
 * @param {number} userId
 * @returns {Promise<UserProduct[]>}
 */
export async function getMyPurchases(userId) {
    return UserProduct.findAll({
        where: { user_id: userId },
        include: [{ model: Product }],
        order: [['purchased_at', 'DESC']],
    });
}

/**
 * Añade un héroe a la colección del usuario.
 * @param {number} userId
 * @param {number} heroId
 * @returns {Promise<UserHero>}
 */
export async function addHeroToUser(userId, heroId) {
    const existing = await UserHero.findOne({ where: { user_id: userId, hero_id: heroId } });
    if (existing) throw new Error('Ya tienes este héroe en tu colección');
    return UserHero.create({ user_id: userId, hero_id: heroId });
}

export default { buyProduct, getMyPurchases, addHeroToUser };