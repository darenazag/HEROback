/**
 * @file Modelo Comment (ESM).
 */
import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
    class Comment extends Model { }

    Comment.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            hero_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: { len: [1, 1000] }
            },
            rating: {
                type: DataTypes.INTEGER,
                validate: { min: 1, max: 5 }
            },
        },
        {
            sequelize,
            modelName: 'Comment',
            tableName: 'comments'
        }
    );

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
        Comment.belongsTo(models.Hero, {
            foreignKey: 'hero_id',
            as: 'hero'
        });
    };

    return Comment;
};
