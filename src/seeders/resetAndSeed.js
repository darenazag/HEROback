/**
 * @file Reset total + seed (ESM). USO SOLO EN DESARROLLO.
 */
import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../models/index.js';
import { seed } from './seedDatabase.js';

(async () => {
    try {
        console.log('💣 DROP & CREATE de todas las tablas...');
        await sequelize.sync({ force: true });
        await seed();
        console.log('🎉 Reset + seed terminado');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
