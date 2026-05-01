-- =============================================================
--  HEROback — Schema PostgreSQL
--  Generado a partir del ERD del proyecto
--  Compatible con Sequelize sync({ force: true })
-- =============================================================

-- Limpiar en orden inverso (respeta FK)
DROP TABLE IF EXISTS team_heroes    CASCADE;
DROP TABLE IF EXISTS teams          CASCADE;
DROP TABLE IF EXISTS user_products  CASCADE;
DROP TABLE IF EXISTS user_heroes    CASCADE;
DROP TABLE IF EXISTS products       CASCADE;
DROP TABLE IF EXISTS heroes         CASCADE;
DROP TABLE IF EXISTS users          CASCADE;

-- Tipos ENUM reutilizables
DO $$ BEGIN
  CREATE TYPE user_role   AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hero_alignment AS ENUM ('good', 'bad', 'neutral', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================
--  TABLA: users
-- =============================================================
CREATE TABLE users (
  id            SERIAL          PRIMARY KEY,
  username      VARCHAR(50)     NOT NULL UNIQUE,
  email         VARCHAR(100)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  role          user_role       NOT NULL DEFAULT 'user',
  coins         INTEGER         NOT NULL DEFAULT 100 CHECK (coins >= 0),
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users             IS 'Usuarios registrados en la plataforma';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt de la contraseña (nunca texto plano)';
COMMENT ON COLUMN users.coins       IS 'Moneda interna para compras en la tienda';
COMMENT ON COLUMN users.role        IS 'admin: acceso total | user: acceso estándar';

-- =============================================================
--  TABLA: heroes
-- =============================================================
CREATE TABLE heroes (
  id            SERIAL          PRIMARY KEY,
  api_id        INTEGER         UNIQUE,           -- ID original de la Superhero API
  name          VARCHAR(100)    NOT NULL,
  image_url     TEXT,
  publisher     VARCHAR(100),
  alignment     hero_alignment  NOT NULL DEFAULT 'unknown',
  intelligence  SMALLINT        NOT NULL DEFAULT 0 CHECK (intelligence BETWEEN 0 AND 100),
  strength      SMALLINT        NOT NULL DEFAULT 0 CHECK (strength     BETWEEN 0 AND 100),
  speed         SMALLINT        NOT NULL DEFAULT 0 CHECK (speed        BETWEEN 0 AND 100),
  durability    SMALLINT        NOT NULL DEFAULT 0 CHECK (durability   BETWEEN 0 AND 100),
  power         SMALLINT        NOT NULL DEFAULT 0 CHECK (power        BETWEEN 0 AND 100),
  combat        SMALLINT        NOT NULL DEFAULT 0 CHECK (combat       BETWEEN 0 AND 100),
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  heroes        IS 'Catálogo de héroes/villanos importados de la Superhero API';
COMMENT ON COLUMN heroes.api_id IS 'ID original de superheroapi.com (1-731)';

-- =============================================================
--  TABLA: products
-- =============================================================
CREATE TABLE products (
  id            SERIAL          PRIMARY KEY,
  name          VARCHAR(100)    NOT NULL,
  description   TEXT,
  price         INTEGER         NOT NULL CHECK (price > 0),
  stock         INTEGER         NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url     TEXT,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  products       IS 'Productos disponibles en la tienda, comprados con coins';
COMMENT ON COLUMN products.price IS 'Coste en coins';
COMMENT ON COLUMN products.stock IS 'Unidades disponibles';

-- =============================================================
--  TABLA: user_heroes  (usuario ↔ héroe, relación N:M)
-- =============================================================
CREATE TABLE user_heroes (
  id          SERIAL      PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  hero_id     INTEGER     NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_hero UNIQUE (user_id, hero_id)   -- un usuario no puede tener el mismo héroe dos veces
);

COMMENT ON TABLE user_heroes IS 'Colección personal de héroes de cada usuario';

-- =============================================================
--  TABLA: user_products  (historial de compras)
-- =============================================================
CREATE TABLE user_products (
  id           SERIAL      PRIMARY KEY,
  user_id      INTEGER     NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id   INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity     INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_products IS 'Historial de compras de cada usuario en la tienda';

-- =============================================================
--  TABLA: teams
-- =============================================================
CREATE TABLE teams (
  id         SERIAL       PRIMARY KEY,
  user_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(80)  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE teams IS 'Equipos de combate creados por los usuarios';

-- =============================================================
--  TABLA: team_heroes  (equipo ↔ user_hero)
-- =============================================================
CREATE TABLE team_heroes (
  id           SERIAL   PRIMARY KEY,
  team_id      INTEGER  NOT NULL REFERENCES teams(id)       ON DELETE CASCADE,
  user_hero_id INTEGER  NOT NULL REFERENCES user_heroes(id) ON DELETE CASCADE,
  position     SMALLINT NOT NULL DEFAULT 1 CHECK (position BETWEEN 1 AND 6),
  CONSTRAINT uq_team_position    UNIQUE (team_id, position),     -- posición única en cada equipo
  CONSTRAINT uq_team_user_hero   UNIQUE (team_id, user_hero_id)  -- héroe único por equipo
);

COMMENT ON TABLE  team_heroes          IS 'Héroes asignados a cada equipo (máximo 6)';
COMMENT ON COLUMN team_heroes.position IS 'Slot del equipo: 1-6';

-- =============================================================
--  ÍNDICES para acelerar las consultas más comunes
-- =============================================================
CREATE INDEX idx_heroes_alignment  ON heroes(alignment);
CREATE INDEX idx_heroes_publisher  ON heroes(publisher);
CREATE INDEX idx_heroes_name       ON heroes(name);
CREATE INDEX idx_user_heroes_user  ON user_heroes(user_id);
CREATE INDEX idx_user_heroes_hero  ON user_heroes(hero_id);
CREATE INDEX idx_user_products_user ON user_products(user_id);
CREATE INDEX idx_teams_user        ON teams(user_id);
CREATE INDEX idx_team_heroes_team  ON team_heroes(team_id);

-- =============================================================
--  TRIGGER: actualizar updated_at automáticamente
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_heroes_updated_at
  BEFORE UPDATE ON heroes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
--  DATOS DE EJEMPLO (seed mínimo para desarrollo)
-- =============================================================

-- Admin por defecto (password: admin123 — bcrypt rounds=12)
INSERT INTO users (username, email, password_hash, role, coins) VALUES
  ('admin', 'admin@heroback.com',
   '$2a$12$KIXBgLCpNfSbRkv91VCjVOovXomOiMiVYLYvVi3DzDIRV/3nJP8Ru',
   'admin', 9999);

-- Productos de ejemplo
INSERT INTO products (name, description, price, stock) VALUES
  ('Traje de combate básico',  'Equipamiento estándar para cualquier héroe.',  200,  50),
  ('Escudo de vibranium',      'Resistente a casi cualquier ataque conocido.', 1500, 10),
  ('Capa de invisibilidad',    'Tecnología de camuflaje avanzada.',            800,  20),
  ('Cinturón de utilidades',   'Gadgets para toda situación.',                 350,  30),
  ('Poción de super-fuerza',   'Multiplica tu fuerza por 2 durante 1 hora.',  100,  100),
  ('Detector de anomalías',    'Detecta amenazas hasta 5 km de distancia.',   600,  15),
  ('Cristal de energía omega', 'Fuente de energía para tu equipo.',            2500, 5),
  ('Comunicador táctico',      'Contacto con tu equipo en cualquier lugar.',   250,  40);

-- =============================================================
--  VERIFICACIÓN rápida (ejecutar tras el seed)
-- =============================================================
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
