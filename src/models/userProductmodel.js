import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modelo UserProduct.
 * Historial de compras del usuario en la tienda.
 */
const UserProduct = sequelize.define('UserProduct', {
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
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE',
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: { min: 1 },
    },
}, {
    tableName: 'user_products',
    timestamps: true,
    createdAt: 'purchased_at',
    updatedAt: false,
});

export default UserProduct;
