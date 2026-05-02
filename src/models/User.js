/**
 * @file Modelo User (ESM).
 */
import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
    class User extends Model {
        /**
         * Compara una contraseña en texto plano contra el hash almacenado.
         * @param {string} plain
         * @returns {Promise<boolean>}
         */
        async checkPassword(plain) {
            return bcrypt.compare(plain, this.password);
        }
        /** Devuelve representación segura sin password. */
        toSafeJSON() {
            const { password, ...rest } = this.toJSON();
            return rest;
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            username: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                validate: { len: [3, 50] },
            },
            email: {
                type: DataTypes.STRING(120),
                allowNull: false,
                unique: true,
                validate: { isEmail: true },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            role: {
                type: DataTypes.ENUM('admin', 'user'),
                allowNull: false,
                defaultValue: 'user',
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            hooks: {
                beforeCreate: async (u) => {
                    if (u.password) u.password = await bcrypt.hash(u.password, 10);
                },
                beforeUpdate: async (u) => {
                    if (u.changed('password')) u.password = await bcrypt.hash(u.password, 10);
                },
            },
        }
    );

    User.associate = (models) => {
        User.hasMany(models.Comment, {
            foreignKey: 'user_id',
            as: 'comments',
            onDelete: 'CASCADE'
        });
    };

    return User;
};
