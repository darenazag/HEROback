/**
 * @file Configuración de Sequelize (ESM).
 * Crea y exporta la instancia única de conexión a PostgreSQL.
 */
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const {
    DB_NAME = 'heroback',
    DB_USER = 'postgres',
    DB_PASSWORD = 'postgres',
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_DIALECT = 'postgres',
    NODE_ENV = 'development',
} = process.env;

/** @type {import('sequelize').Sequelize} */
export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: DB_DIALECT,
    logging: NODE_ENV === 'development' ? (msg) => console.log(`[SQL] ${msg}`) : false,
    define: { timestamps: true, underscored: true },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

/** Verifica conexión a la BD. */
export async function testConnection() {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida');
}

export default sequelize;
