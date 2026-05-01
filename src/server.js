/**
 * @file Punto de entrada del servidor (ESM).
 */
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { sequelize, testConnection } from './config/database.js';

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await testConnection();
        await sequelize.sync(); // En prod usar migraciones
        app.listen(PORT, () => {
            console.log(`🦸 HEROback escuchando en http://localhost:${PORT}`);
            console.log(`📘 Docs API: http://localhost:${PORT}/api/docs`);
        });
    } catch (err) {
        console.error('❌ Error iniciando el servidor:', err);
        process.exit(1);
    }
}

start();
