/**
 * @file Modelo Hero (ESM).
 */
import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
    class Hero extends Model { }

    Hero.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true, primaryKey: true
            },
            external_id: {
                type: DataTypes.STRING(20),
                unique: true, comment: 'ID en SuperHero API'
            },
            name: {
                type: DataTypes.STRING(120),
                allowNull: false
            },
            full_name: {
                type: DataTypes.STRING(150)
            },
            publisher: {
                type: DataTypes.STRING(80)
            },
            alignment: {
                type: DataTypes.ENUM('good', 'bad', 'neutral'),
                defaultValue: 'good'
            },
            gender: {
                type: DataTypes.STRING(20)
            },
            race: {
                type: DataTypes.STRING(60)
            },
            height_cm: {
                type: DataTypes.INTEGER
            },
            weight_kg: {
                type: DataTypes.INTEGER
            },
            eye_color: {
                type: DataTypes.STRING(40)
            },
            hair_color: {
                type: DataTypes.STRING(40)
            },
            first_appearance: {
                type: DataTypes.STRING(120)
            },
            image_url: {
                type: DataTypes.TEXT
            },
        },
        { sequelize, modelName: 'Hero', tableName: 'heroes' }
    );

    Hero.associate = (models) => {
        Hero.hasMany(models.Power, {
            foreignKey: 'hero_id',
            as: 'powers',
            onDelete: 'CASCADE'
        });
        Hero.hasMany(models.Comment, {
            foreignKey: 'hero_id',
            as: 'comments', onDelete: 'CASCADE'
        });
    };

    return Hero;
};
