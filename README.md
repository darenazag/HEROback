# 🦸 HEROback

Este proyecto consiste en la construcción del Backend de una plataforma con temática de superhéroes, en donde los usuarios podrán:

    - Registrarse e iniciar sesión
    - Gestionar su perfil
    - Comprar y gestionar elementos dentro de una tienda
    - Sirve como plataforma para futuros juegos (PvE o PvP)

La tienda es solo una parte de un sistema más grande, donde la lógica principal puede girar en torno a la interacción entre usuarios, sus recursos y mecánicas de juego.

> **Stack:** Node.js · Express · Sequelize · PostgreSQL · Pug · JWT · Swagger.

---

## 📋 Tabla de contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación rápida](#instalación-rápida)
- [Variables de entorno](#variables-de-entorno)
- [Modelo de datos](#modelo-de-datos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Endpoints principales](#endpoints-principales)
- [Paginación, filtros y orden](#paginación-filtros-y-orden)
- [Documentación de la API (Swagger)](#documentación-de-la-api-swagger)
- [Vistas Pug](#vistas-pug)
- [Scripts](#scripts)

---

## Características

- 🔐 **Autenticación dual:** sesiones (Pug) + JWT (API REST).
- 👥 **Autorización por roles:** `admin` y `user`.
- 🗄 **Base de datos relacional** con 7 tablas y restricciones de integridad.
- 🧩 **ORM Sequelize** con asociaciones 1:N y N:M.
- 🎨 **Vistas Pug** server-side renderizadas con tema oscuro.
- 📑 **Documentación OpenAPI 3.0** generada automáticamente desde JSDoc.
- ↕ **Paginación, filtrado y ordenamiento** configurables vía querystring.
- 🌱 **Seed offline** (24 héroes curados) + opción `--live` para SuperHero API.
- 🐳 **Docker Compose** con PostgreSQL + pgAdmin.

---

## Requisitos

- Node.js ≥ 18
- PostgreSQL ≥ 13 (o usa el `docker-compose.yml` incluido)
- npm

---

## Instalación rápida

```bash
# 1. Clonar e instalar
git clone <tu-fork> heroback && cd heroback
npm install

# 2. Configurar entorno
cp .env.example .env
# (edita .env con tus credenciales de Postgres)

# 3a. (Opción A) Levantar PostgreSQL + pgAdmin con Docker
docker compose up -d

# 3b. (Opción B) Usa tu propio Postgres local y crea la BD:
#     createdb heroback_db

# 4. Resetear y poblar la BD (offline, sin API key)
npm run db:reset

# 5. Arrancar el servidor
npm start
```

Visita:

| URL                                | Qué hay                          |
| ---------------------------------- | -------------------------------- |
| http://localhost:3000              | Página de inicio (Pug)           |
| http://localhost:3000/heroes       | Catálogo con paginación/filtros  |
| http://localhost:3000/api/docs     | Swagger UI                       |
| http://localhost:5050              | pgAdmin (si usaste docker)       |

### Usuarios precargados

| Email                  | Contraseña | Rol   |
| ---------------------- | ---------- | ----- |
| `admin@heroback.com`   | `admin123` | admin |
| `demo@heroback.com`    | `demo123`  | user  |

---

## Variables de entorno

```ini
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=heroback_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=cambiar_por_secreto_largo
SESSION_SECRET=otro_secreto_largo

SUPERHERO_API_KEY=        # opcional, para `npm run seed:live`
```

---

## Modelo de datos

```
users ──┬── user_heroes ──── heroes
        ├── user_products ── products
        └── teams ────────── team_heroes ── user_heroes
```

| Tabla           | Propósito                                             |
| --------------- | ----------------------------------------------------- |
| `users`         | Credenciales, rol y moneda interna (`coins`).         |
| `heroes`        | Catálogo importado de la SuperHero API.               |
| `products`      | Tienda interna pagada con `coins`.                    |
| `user_heroes`   | Colección personal de héroes (N:M user↔hero).         |
| `user_products` | Historial de compras.                                 |
| `teams`         | Equipos creados por un usuario.                       |
| `team_heroes`   | Slots de héroes dentro de cada equipo (máx. 6).       |

> Esquema SQL de referencia disponible en `heroback_schema.sql`.

---

## Estructura del proyecto

```
heroback/
├── index.js                  # Bootstrap Express
├── docker-compose.yml        # Postgres + pgAdmin
├── heroback_schema.sql       # Esquema SQL de referencia
├── docs/
│   └── MEMORIA.md            # Memoria académica del proyecto
├── public/                   # Assets estáticos
├── scripts/
│   └── seed.js               # Seed offline + live (--live)
└── src/
    ├── config/
    │   ├── db.js             # Instancia Sequelize
    │   └── swagger.js        # Configuración OpenAPI
    ├── middlewares/
    │   ├── authMiddleware.js     # verifyToken + checkRole (API)
    │   ├── sessionMiddleware.js  # requireSession + requireAdmin (vistas)
    │   └── queryFeatures.js      # paginación / filtros / orden
    ├── models/               # Modelos Sequelize + asociaciones
    ├── controllers/          # Capa HTTP (req/res)
    ├── services/             # Lógica de negocio
    ├── routes/               # Routers Express + JSDoc Swagger
    ├── seeders/heroes.json   # Dataset offline curado
    └── views/                # Plantillas Pug
```

---

## Endpoints principales

### Auth (públicos)
| Método | Ruta                  | Descripción                  |
| ------ | --------------------- | ---------------------------- |
| POST   | `/api/auth/register`  | Crea un usuario              |
| POST   | `/api/auth/login`     | Devuelve `{ token, user }`   |
| GET    | `/api/auth/me`        | Perfil (requiere JWT)        |

### Heroes
| Método | Ruta                       | Auth         |
| ------ | -------------------------- | ------------ |
| GET    | `/api/heroes`              | público      |
| GET    | `/api/heroes/:id`          | público      |
| GET    | `/api/heroes/mis-heroes`   | usuario      |
| POST   | `/api/heroes`              | **admin**    |
| PATCH  | `/api/heroes/:id`          | **admin**    |
| DELETE | `/api/heroes/:id`          | **admin**    |

### Tienda y colección
| Método | Ruta                          | Auth     |
| ------ | ----------------------------- | -------- |
| GET    | `/api/products`               | público  |
| POST   | `/api/store/buy`              | usuario  |
| POST   | `/api/store/add-hero`         | usuario  |
| GET    | `/api/store/my-purchases`     | usuario  |

### Equipos
| Método | Ruta                | Auth     |
| ------ | ------------------- | -------- |
| GET    | `/api/teams`        | usuario  |
| POST   | `/api/teams`        | usuario  |
| PATCH  | `/api/teams/:id`    | propietario |
| DELETE | `/api/teams/:id`    | propietario |

### Admin
| Método | Ruta                 | Auth     |
| ------ | -------------------- | -------- |
| GET    | `/api/users`         | admin    |
| DELETE | `/api/users/:id`     | admin    |
| GET    | `/api/admin/stats`   | admin    |

> 👉 **3 endpoints con modificación de BD obligatorios cumplidos:**
> `POST /api/heroes`, `PATCH /api/heroes/:id`, `DELETE /api/heroes/:id`,
> `POST /api/store/buy`, `POST /api/teams`, `PATCH /api/teams/:id`, etc.

---

## Paginación, filtros y orden

Todos los endpoints de listado (`/heroes`, `/products`, `/users`) aceptan:

```
?page=2                         # paginación
?limit=10                       # tamaño de página (máx 100)
?sort=name                      # orden ASC
?sort=-strength                 # orden DESC
?sort=-strength,name            # multi-orden
?<campo>=valor                  # filtro exacto
?<campo>__like=foo              # iLIKE  %foo%
?<campo>__gte=80                # >=
?<campo>__lte=20                # <=
?<campo>__ne=bad                # !=
```

Ejemplo:

```
GET /api/heroes?alignment=good&strength__gte=80&sort=-strength&page=1&limit=12
```

Respuesta:

```json
{
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 12, "total": 47, "pages": 4 }
}
```

---

## Documentación de la API (Swagger)

- **Swagger UI:**  http://localhost:3000/api/docs
- **OpenAPI JSON:** http://localhost:3000/api/docs.json

El spec se genera con `swagger-jsdoc` a partir de los comentarios `@openapi`
en los archivos `src/routes/*.js`.

---

## Vistas Pug

| Ruta            | Descripción                                |
| --------------- | ------------------------------------------ |
| `/`             | Landing con héroes destacados              |
| `/heroes`       | Catálogo con búsqueda, filtros, paginación |
| `/heroes/:id`   | Detalle del héroe                          |
| `/store`        | Tienda                                     |
| `/teams`        | Mis equipos                                |
| `/login`        | Login (sesión)                             |
| `/register`     | Registro                                   |
| `/dashboard`    | Panel del usuario                          |
| `/perfil`       | Editar perfil                              |
| `/admin`        | Panel admin (sólo `role=admin`)            |

---

## Scripts

| Comando              | Acción                                                          |
| -------------------- | --------------------------------------------------------------- |
| `npm start`          | Servidor en producción                                          |
| `npm run dev`        | Servidor con nodemon (auto-reload)                              |
| `npm run seed`       | Seed offline (admin + demo + productos + 24 héroes)             |
| `npm run seed:live`  | Igual + descarga ~731 héroes desde superheroapi.com             |
| `npm run db:reset`   | DROP + CREATE de tablas y luego seed                            |

---

## Memoria del proyecto

Ver [`docs/MEMORIA.pdf`](docs/MEMORIA.pdf) para decisiones técnicas, retos y
soluciones.