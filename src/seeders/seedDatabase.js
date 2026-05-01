/**
 * @file Seeder principal: usuarios, héroes y poderes (ESM).
 * Uso: node src/seeders/seedDatabase.js [--live]
 *   --live  intenta usar la SuperHero API (requiere SUPERHERO_API_TOKEN).
 */
import dotenv from 'dotenv';
dotenv.config();

import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { sequelize, User, Hero, Power, Comment } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USE_LIVE = process.argv.includes('--live');

async function fetchFromApi() {
    const token = process.env.SUPERHERO_API_TOKEN;
    const base = process.env.SUPERHERO_API_URL || 'https://superheroapi.com/api';
    if (!token) {
        console.warn('⚠️  SUPERHERO_API_TOKEN no definido — usando dataset offline.');
        return null;
    }
    const heroes = [];
    for (let id = 1; id <= 60; id++) {
        try {
            const res = await fetch(`${base}/${token}/${id}`);
            const data = await res.json();
            if (data?.response === 'success') heroes.push(data);
        } catch (e) { console.warn(`hero ${id}: ${e.message}`); }
    }
    return heroes.map((h) => ({
        external_id: h.id,
        name: h.name,
        full_name: h.biography?.['full-name'] || null,
        publisher: h.biography?.publisher || null,
        alignment: ['good', 'bad', 'neutral'].includes(h.biography?.alignment) ? h.biography.alignment : 'neutral',
        gender: h.appearance?.gender || null,
        race: h.appearance?.race || null,
        height_cm: parseInt(String(h.appearance?.height?.[1] || '').replace(/\D/g, '')) || null,
        weight_kg: parseInt(String(h.appearance?.weight?.[1] || '').replace(/\D/g, '')) || null,
        eye_color: h.appearance?.['eye-color'] || null,
        hair_color: h.appearance?.['hair-color'] || null,
        first_appearance: h.biography?.['first-appearance'] || null,
        image_url: h.image?.url || null,
        _powerstats: h.powerstats || null,
    }));
}

async function loadOffline() {
    const file = path.join(__dirname, 'heroes.json');
    const raw = await readFile(file, 'utf8');
    return JSON.parse(raw);
}

export async function seed() {
    console.log('🌱 Iniciando seeders...');
    await sequelize.sync();

    // Usuarios
    const usersData = [
        { username: 'admin', email: 'admin@heroback.dev', password: 'admin123', role: 'admin' },
        { username: 'peter', email: 'peter@heroback.dev', password: 'peter123', role: 'user' },
        { username: 'mary', email: 'mary@heroback.dev', password: 'mary123', role: 'user' },
    ];
    const users = [];
    for (const u of usersData) {
        const [user] = await User.findOrCreate({ where: { email: u.email }, defaults: u });
        users.push(user);
    }
    console.log(`👤 Usuarios: ${users.length}`);

    // Héroes
    const heroesData = USE_LIVE ? (await fetchFromApi()) || (await loadOffline()) : await loadOffline();
    let heroCount = 0;
    let powerCount = 0;
    for (const h of heroesData) {
        const { _powerstats, ...heroFields } = h;
        const [hero, created] = await Hero.findOrCreate({
            where: { name: heroFields.name }, defaults: heroFields,
        });
        if (created) heroCount++;
        const stats = _powerstats || {
            intelligence: 50, strength: 50, speed: 50, durability: 50, power: 50, combat: 50,
        };
        for (const [name, level] of Object.entries(stats)) {
            const lv = parseInt(level) || 50;
            await Power.findOrCreate({
                where: { hero_id: hero.id, name },
                defaults: {
                    hero_id: hero.id, name, level: Math.min(100, Math.max(1, lv)),
                    description: `Nivel base de ${name} para ${hero.name}`
                },
            });
            powerCount++;
        }
    }
    console.log(`🦸 Héroes nuevos: ${heroCount} (total dataset: ${heroesData.length})`);
    console.log(`⚡ Poderes (upserts): ${powerCount}`);

    // Comentarios demo
    const someHeroes = await Hero.findAll({ limit: 5 });
    for (const hero of someHeroes) {
        await Comment.findOrCreate({
            where: { user_id: users[1].id, hero_id: hero.id },
            defaults: { user_id: users[1].id, hero_id: hero.id, content: `¡${hero.name} es increíble!`, rating: 5 },
        });
    }
    console.log('💬 Comentarios demo creados');
    console.log('✅ Seed completo');
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => { console.error(e); process.exit(1); });
}
