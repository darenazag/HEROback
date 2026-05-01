import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modelo UserHero.
 * Tabla pivote que registra qué héroes posee cada usuario.
 */
const UserHero = sequelize.define('UserHero', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
    },
    hero_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'heroes',
            key: 'id'
        },
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'user_heroes',
    timestamps: true,
    createdAt: 'acquired_at',
    updatedAt: false,
});

export default UserHero;
