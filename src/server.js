/**
 * @file Punto de entrada del servidor (ESM).
 * Carga env, importa modelos (registra asociaciones) y arranca Express.
 */
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { sequelize, testConnection } from './config/database.js';
// Importar models/index.js asegura que TODOS los modelos y asociaciones
// queden registrados en la instancia de Sequelize antes de sync().
import './models/index.js';

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await testConnection();
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
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