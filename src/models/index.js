import sequelize from '../config/db.js';
import User from './userModel.js';
import Hero from './heroModel.js';
import Product from './productModel.js';
import UserHero from './userHeroModel.js';
import UserProduct from './userProductModel.js';
import Team from './teamModel.js';
import TeamHero from './teamHeroModel.js';

/* ── Asociaciones ──────────────────────────────────────── */

// User <-> Hero via UserHero
User.hasMany(UserHero, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});
UserHero.belongsTo(User, {
    foreignKey: 'user_id'
});
Hero.hasMany(UserHero, {
    foreignKey: 'hero_id',
    onDelete: 'CASCADE'
});
UserHero.belongsTo(Hero, {
    foreignKey: 'hero_id'
});

// User <-> Product via UserProduct
User.hasMany(UserProduct, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});
UserProduct.belongsTo(User, {
    foreignKey: 'user_id'
});
Product.hasMany(UserProduct, {
    foreignKey: 'product_id',
    onDelete: 'CASCADE'
});
UserProduct.belongsTo(Product, {
    foreignKey: 'product_id'
});

// User <-> Team
User.hasMany(Team, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});
Team.belongsTo(User, {
    foreignKey: 'user_id'
});

// Team <-> UserHero via TeamHero
Team.hasMany(TeamHero, {
    foreignKey: 'team_id',
    onDelete: 'CASCADE'
});
TeamHero.belongsTo(Team, {
    foreignKey: 'team_id'
});
UserHero.hasMany(TeamHero, {
    foreignKey: 'user_hero_id',
    onDelete: 'CASCADE'
});
TeamHero.belongsTo(UserHero, {
    foreignKey: 'user_hero_id'
});

export default sequelize;
export { sequelize, User, Hero, Product, UserHero, UserProduct, Team, TeamHero };