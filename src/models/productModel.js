import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modelo Product.
 * Artículos disponibles en la tienda, comprados con coins.
 */
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 },
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Product;
