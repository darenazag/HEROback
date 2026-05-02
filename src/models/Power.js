/**
 * @file Modelo Power (ESM).
 */
import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
    class Power extends Model { }

    Power.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            hero_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING(80),
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT
            },
            level: {
                type: DataTypes.INTEGER,
                validate: { min: 1, max: 100 },
                defaultValue: 50
            },
        },
        {
            sequelize,
            modelName: 'Power',
            tableName: 'powers'
        }
    );

    Power.associate = (models) => {
        Power.belongsTo(models.Hero, {
            foreignKey: 'hero_id',
            as: 'hero'
        });
    };

    return Power;
};