/**
 * @file Reexporta la instancia única de Sequelize definida en `db.js`
 * para evitar tener dos conexiones distintas y asegurar que `sequelize.sync()`
 * registre los modelos definidos en `src/models/index.js`.
 */
import sequelize from './db.js';

/** Verifica conexión a la BD. */
export async function testConnection() {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida');
}

export { sequelize };
export default sequelize;