import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modelo User.
 * Almacena credenciales, rol y moneda interna (coins).
 */
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: { len: [3, 50] }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user',
        allowNull: false
    },
    coins: {
        type: DataTypes.INTEGER,
        defaultValue: 1000,
        allowNull: false,
        validate: { min: 0 }
    },
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default User;