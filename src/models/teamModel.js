import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
/**
 * Modelo Team.
 * Equipo de combate creado por un usuario.
 */
const Team = sequelize.define('Team', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
    },
    name: {
        type: DataTypes.STRING(80),
        allowNull: false,
        validate: { len: [1, 80] },
    },
}, {
    tableName: 'teams',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Team;
