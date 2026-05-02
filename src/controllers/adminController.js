import * as adminService from '../services/adminService.js';

/** GET /api/admin/stats */
export async function getStats(req, res) {
    try {
        return res.status(200).json(await adminService.getStats());
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export const functions = { getStats };
export default functions;