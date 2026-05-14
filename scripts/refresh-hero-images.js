/**
 * @file scripts/refresh-hero-images.js
 * @description Actualiza el campo `image_url` de los héroes existentes desde
 * superheroapi.com sin tocar el resto de datos.
 *
 * Uso: node scripts/refresh-hero-images.js
 *
 * Requiere SUPERHERO_API_KEY en .env. Si el campo `api_id` no está poblado,
 * el héroe se omite.
 *
 * Nota: aunque la URL siga apuntando a superherodb.com, sirve igualmente,
 * porque las imágenes ahora se sirven a través del proxy del backend
 * (/api/heroes/:id/image) que oculta el header Referer. Este script es
 * útil sobre todo si quieres refrescar URLs que hayan caducado.
 */
import 'dotenv/config';
import axios from 'axios';
import { sequelize, Hero } from '../src/models/index.js';

async function main() {
    const API_KEY = process.env.SUPERHERO_API_KEY;
    if (!API_KEY) {
        console.error('❌ SUPERHERO_API_KEY no está definida en .env');
        process.exit(1);
    }

    try {
        await sequelize.authenticate();
        console.log('🔌 BD conectada');

        const heroes = await Hero.findAll({
            where: { api_id: { [sequelize.Sequelize.Op.ne]: null } },
        });

        if (heroes.length === 0) {
            console.warn('⚠ No hay héroes con api_id. Ejecuta antes `npm run seed` o `npm run seed:live`.');
            return;
        }

        console.log(`🖼  Refrescando imágenes de ${heroes.length} héroes...`);
        const BASE = `https://superheroapi.com/api/${API_KEY}`;
        let updated = 0, skipped = 0;
        const BATCH = 10;

        for (let i = 0; i < heroes.length; i += BATCH) {
            const batch = heroes.slice(i, i + BATCH);
            const results = await Promise.allSettled(
                batch.map((h) => axios.get(`${BASE}/${h.api_id}/image`, { timeout: 10000 })),
            );
            for (let j = 0; j < batch.length; j++) {
                const r = results[j];
                const hero = batch[j];
                if (r.status !== 'fulfilled' || !r.value?.data?.url) { skipped++; continue; }
                if (r.value.data.url !== hero.image_url) {
                    await hero.update({ image_url: r.value.data.url });
                    updated++;
                } else {
                    skipped++;
                }
            }
            process.stdout.write(`   procesados ${Math.min(i + BATCH, heroes.length)}/${heroes.length}\r`);
        }
        console.log(`\n✅ Actualizadas: ${updated}, sin cambios u omitidas: ${skipped}`);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

main();
