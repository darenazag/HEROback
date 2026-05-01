import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modelo Hero. Campos compatibles con la Superhero API.
 */
const Hero = sequelize.define('Hero', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    api_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    publisher: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    alignment: {
        type: DataTypes.ENUM('good', 'bad', 'neutral', 'unknown'),
        defaultValue: 'unknown'
    },
    intelligence: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    strength: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    speed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    durability: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    power: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    combat: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
}, {
    tableName: 'heroes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Hero;