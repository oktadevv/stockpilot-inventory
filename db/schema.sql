-- StockPilot schema for Neon (PostgreSQL)
-- Option A (recommended): deploy to Vercel, set DATABASE_URL, then open /api/seed once.
-- Option B: paste this file into the Neon SQL Editor and run it manually.

CREATE TABLE IF NOT EXISTS products (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  sku       TEXT NOT NULL UNIQUE,
  category  TEXT NOT NULL DEFAULT 'Beverages',
  stock     INTEGER NOT NULL DEFAULT 0,
  threshold INTEGER NOT NULL DEFAULT 20,
  cost      NUMERIC(12,2) NOT NULL DEFAULT 0,
  price     NUMERIC(12,2) NOT NULL DEFAULT 0,
  supplier  TEXT NOT NULL DEFAULT '',
  gradient  TEXT NOT NULL DEFAULT 'from-primary-500 to-indigo-700',
  icon      TEXT NOT NULL DEFAULT 'Package'
);

CREATE TABLE IF NOT EXISTS suppliers (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  contact   TEXT NOT NULL DEFAULT '',
  email     TEXT NOT NULL DEFAULT '',
  phone     TEXT NOT NULL DEFAULT '',
  products  INTEGER NOT NULL DEFAULT 0,
  rating    NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  status    TEXT NOT NULL DEFAULT 'Active',
  gradient  TEXT NOT NULL DEFAULT 'from-primary-500 to-indigo-700',
  last_order TEXT NOT NULL DEFAULT ''
);
