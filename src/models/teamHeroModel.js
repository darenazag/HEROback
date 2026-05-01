import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modelo TeamHero.
 * Héroes que forman parte de un equipo (máx. 6 por equipo).
 */
const TeamHero = sequelize.define('TeamHero', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'teams', key: 'id' },
        onDelete: 'CASCADE',
    },
    user_hero_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'user_heroes', key: 'id' },
        onDelete: 'CASCADE',
    },
    position: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: { min: 1, max: 6 },
    },
}, {
    tableName: 'team_heroes',
    timestamps: false,
});

export default TeamHero;
