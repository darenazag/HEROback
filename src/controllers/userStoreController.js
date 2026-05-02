import * as userStoreService from '../services/userStoreService.js';

/** POST /api/store/buy */
export async function buyProduct(req, res) {
    try {
        const { productId, quantity = 1 } = req.body;
        if (!productId) return res.status(400).json({ error: 'productId es obligatorio' });
        const result = await userStoreService.buyProduct(req.user.id, productId, quantity);
        return res.status(200).json({ message: 'Compra realizada con éxito', ...result });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/** GET /api/store/my-purchases */
export async function getMyPurchases(req, res) {
    try {
        return res.status(200).json(await userStoreService.getMyPurchases(req.user.id));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

/** POST /api/store/add-hero */
export async function addHero(req, res) {
    try {
        const { heroId } = req.body;
        if (!heroId) return res.status(400).json({ error: 'heroId es obligatorio' });
        const userHero = await userStoreService.addHeroToUser(req.user.id, heroId);
        return res.status(201).json({ message: 'Héroe añadido a tu colección', userHero });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export const functions = { buyProduct, getMyPurchases, addHero };

export default functions;