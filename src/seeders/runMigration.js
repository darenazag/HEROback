/**
 * @file Sincroniza modelos con la BD usando sequelize.sync (ESM).
 */
import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../models/index.js';

(async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Esquema sincronizado');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
