/**
 * @file imageProxyService.js
 * @description Proxy de imágenes externas.
 *
 * Motivo: algunos servicios (p. ej. superherodb.com) bloquean las
 * solicitudes con hotlink protection (devuelven 403 cuando el header
 * Referer no apunta a su propio dominio). Al pedirlas desde el servidor
 * controlamos qué cabeceras se envían y servimos la imagen al
 * navegador como si fuera local.
 *
 * Además se cachean los resultados en memoria durante un tiempo
 * razonable para evitar pegarle al origen en cada navegación.
 */

const TTL_MS = 1000 * 60 * 60 * 24; // 24h
const MAX_CACHE_ENTRIES = 500;
const FETCH_TIMEOUT_MS = 8000;

/** @type {Map<string, { buffer: Buffer, contentType: string, expiresAt: number }>} */
const cache = new Map();

/**
 * Comprueba que la URL es http(s) válida.
 * Evita ser usado como SSRF contra direcciones internas obvias.
 * @param {string} url
 * @returns {URL|null}
 */
function safeParseUrl(url) {
    if (!url || typeof url !== 'string') return null;
    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return null;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

    // Bloquea hosts locales evidentes para mitigar SSRF.
    const host = parsed.hostname.toLowerCase();
    const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blocked.includes(host) || host.endsWith('.local')) return null;
    if (host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('169.254.')) return null;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return null;

    return parsed;
}

/**
 * Descarga una imagen externa y la devuelve como Buffer.
 * Cachea en memoria por TTL_MS.
 *
 * @param {string} url
 * @returns {Promise<{ buffer: Buffer, contentType: string } | null>}
 */
export async function fetchImage(url) {
    const parsed = safeParseUrl(url);
    if (!parsed) return null;
    const key = parsed.href;

    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return { buffer: cached.buffer, contentType: cached.contentType };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        const res = await fetch(parsed.href, {
            signal: controller.signal,
            // El truco principal: no enviamos Referer.
            // Algunos orígenes también requieren un User-Agent "normal".
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; HEROback/1.0)',
                Accept: 'image/*,*/*;q=0.8',
            },
            redirect: 'follow',
        });
        if (!res.ok) return null;

        const contentType = res.headers.get('content-type') || 'image/jpeg';
        if (!contentType.startsWith('image/')) return null;

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // LRU sencillo: si hay demasiadas entradas, descarta la primera (oldest).
        if (cache.size >= MAX_CACHE_ENTRIES) {
            const firstKey = cache.keys().next().value;
            if (firstKey) cache.delete(firstKey);
        }
        cache.set(key, { buffer, contentType, expiresAt: Date.now() + TTL_MS });

        return { buffer, contentType };
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

export default { fetchImage };
