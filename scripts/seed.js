/**
 * @file scripts/seed.js
 * @description Seed de la base de datos.
 *
 * Modos:
 *   node scripts/seed.js            → seed offline (heroes.json + admin + productos)
 *   node scripts/seed.js --reset    → DROP + CREATE de todas las tablas y luego seed
 *   node scripts/seed.js --live     → además importa héroes desde la SuperHero API
 *                                     (requiere SUPERHERO_API_KEY en .env)
 */
import 'dotenv/config';
import path from 'path';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import axios from 'axios';

import { sequelize, Hero, User, Product } from '../src/models/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));

/* ─────────────────────────────────────────────────────── */
async function seedAdmin() {
    console.log('👤 Creando usuario admin...');
    const existing = await User.findOne({ where: { email: 'admin@heroback.com' } });
    if (existing) {
        console.log('   ↳ admin ya existe, se omite');
        return;
    }
    const password_hash = await bcrypt.hash('admin123', 12);
    await User.create({
        username: 'admin',
        email: 'admin@heroback.com',
        password_hash,
        role: 'admin',
        coins: 9999,
    });
    console.log('   ✅ admin@heroback.com / admin123');
}

async function seedDemoUser() {
    const existing = await User.findOne({ where: { email: 'demo@heroback.com' } });
    if (existing) return;
    await User.create({
        username: 'demo',
        email: 'demo@heroback.com',
        password_hash: await bcrypt.hash('demo123', 12),
        role: 'user',
        coins: 2500,
    });
    console.log('   ✅ demo@heroback.com / demo123');
}

async function seedProducts() {
    console.log('🛒 Creando productos...');
    const products = [
        { name: 'Traje de combate básico', price: 200, stock: 50, description: 'Equipamiento estándar para héroes novatos.' },
        { name: 'Escudo de vibranium', price: 1500, stock: 10, description: 'Aleación indestructible.' },
        { name: 'Capa de invisibilidad', price: 800, stock: 20, description: 'Te vuelve indetectable durante 60s.' },
        { name: 'Cinturón de utilidades', price: 350, stock: 30, description: 'Diez bolsillos, mil opciones.' },
        { name: 'Poción de super-fuerza', price: 100, stock: 100, description: '+50 fuerza temporal.' },
        { name: 'Detector de anomalías', price: 600, stock: 15, description: 'Localiza fluctuaciones cósmicas.' },
        { name: 'Cristal de energía omega', price: 2500, stock: 5, description: 'Fuente de poder ilimitado.' },
        { name: 'Comunicador táctico', price: 250, stock: 40, description: 'Comunicación segura entre miembros del equipo.' },
    ];
    for (const p of products) {
        const ex = await Product.findOne({ where: { name: p.name } });
        if (!ex) await Product.create(p);
    }
    console.log(`   ✅ ${products.length} productos listos`);
}

/* ─────────────────────────────────────────────────────── */
async function seedHeroesOffline() {
    console.log('🦸 Cargando héroes desde dataset offline...');
    const file = path.join(__dirname, '..', 'src', 'seeders', 'heroes.json');
    const heroes = JSON.parse(await readFile(file, 'utf8'));
    let imported = 0;
    for (const h of heroes) {
        await Hero.upsert(h);
        imported++;
    }
    console.log(`   ✅ ${imported} héroes importados (offline)`);
}

function clamp(n) {
    const v = parseInt(n, 10);
    return isNaN(v) ? 0 : Math.max(0, Math.min(v, 100));
}
function toAlignment(v) {
    const x = String(v || '').toLowerCase();
    return ['good', 'bad', 'neutral'].includes(x) ? x : 'unknown';
}

async function seedHeroesLive() {
    const API_KEY = process.env.SUPERHERO_API_KEY;
    if (!API_KEY) {
        console.warn('⚠ SUPERHERO_API_KEY no definida — se omite import live');
        return;
    }
    console.log('🌐 Importando héroes desde superheroapi.com...');
    const BASE = `https://superheroapi.com/api/${API_KEY}`;
    let imported = 0, skipped = 0;
    const TOTAL = 731, BATCH = 30;

    for (let s = 1; s <= TOTAL; s += BATCH) {
        const ids = Array.from({ length: Math.min(BATCH, TOTAL - s + 1) }, (_, i) => s + i);
        const results = await Promise.allSettled(
            ids.map((id) => axios.get(`${BASE}/${id}`, { timeout: 10000 }))
        );
        for (const r of results) {
            if (r.status !== 'fulfilled') { skipped++; continue; }
            const d = r.value.data;
            if (!d || d.response === 'error') { skipped++; continue; }
            try {
                await Hero.upsert({
                    api_id: parseInt(d.id, 10),
                    name: d.name,
                    image_url: d.image?.url || null,
                    publisher: d.biography?.publisher || null,
                    alignment: toAlignment(d.biography?.alignment),
                    intelligence: clamp(d.powerstats?.intelligence),
                    strength: clamp(d.powerstats?.strength),
                    speed: clamp(d.powerstats?.speed),
                    durability: clamp(d.powerstats?.durability),
                    power: clamp(d.powerstats?.power),
                    combat: clamp(d.powerstats?.combat),
                });
                imported++;
            } catch { skipped++; }
        }
        process.stdout.write(`   procesados ${Math.min(s + BATCH - 1, TOTAL)}/${TOTAL}\r`);
    }
    console.log(`\n   ✅ live: ${imported} importados, ${skipped} omitidos`);
}

/* ─────────────────────────────────────────────────────── */
async function main() {
    try {
        await sequelize.authenticate();
        console.log('🔌 BD conectada');

        const force = args.has('--reset');
        await sequelize.sync({ force, alter: !force });
        if (force) console.log('💣 Tablas recreadas (--reset)');

        await seedAdmin();
        await seedDemoUser();
        await seedProducts();
        await seedHeroesOffline();
        if (args.has('--live')) await seedHeroesLive();

        console.log('🎉 Seed completado correctamente');
    } catch (err) {
        console.error('❌ Error en seed:', err.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

main();