// One-time database setup + demo seed.
// After deploying to Vercel with DATABASE_URL set, open https://<your-app>.vercel.app/api/seed ONCE in the browser.
// Afterwards you may delete this file (and redeploy) so nobody can re-seed your database.
import { getSql } from "./_db.js";
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS } from "../src/data.js";

export default async function handler(req, res) {
  try {
    const sql = getSql();

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY, name TEXT NOT NULL, sku TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL DEFAULT 'Beverages',
        stock INTEGER NOT NULL DEFAULT 0, threshold INTEGER NOT NULL DEFAULT 20,
        cost NUMERIC(12,2) NOT NULL DEFAULT 0, price NUMERIC(12,2) NOT NULL DEFAULT 0,
        supplier TEXT NOT NULL DEFAULT '',
        gradient TEXT NOT NULL DEFAULT 'from-primary-500 to-indigo-700',
        icon TEXT NOT NULL DEFAULT 'Package'
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY, name TEXT NOT NULL, contact TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '',
        products INTEGER NOT NULL DEFAULT 0, rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
        status TEXT NOT NULL DEFAULT 'Active',
        gradient TEXT NOT NULL DEFAULT 'from-primary-500 to-indigo-700',
        last_order TEXT NOT NULL DEFAULT ''
      )`;

    const seeded = { products: 0, suppliers: 0 };
    const [{ count: pc }] = await sql`SELECT COUNT(*)::int AS count FROM products`;
    if (pc === 0) {
      for (const p of INITIAL_PRODUCTS) {
        await sql`INSERT INTO products (name, sku, category, stock, threshold, cost, price, supplier, gradient, icon)
          VALUES (${p.name}, ${p.sku}, ${p.category}, ${p.stock}, ${p.threshold}, ${p.cost}, ${p.price}, ${p.supplier}, ${p.gradient}, ${p.icon})`;
        seeded.products++;
      }
    }
    const [{ count: sc }] = await sql`SELECT COUNT(*)::int AS count FROM suppliers`;
    if (sc === 0) {
      for (const s of INITIAL_SUPPLIERS) {
        await sql`INSERT INTO suppliers (name, contact, email, phone, products, rating, status, gradient, last_order)
          VALUES (${s.name}, ${s.contact}, ${s.email}, ${s.phone}, ${s.products}, ${s.rating}, ${s.status}, ${s.gradient}, ${s.lastOrder})`;
        seeded.suppliers++;
      }
    }

    const [{ count: totalP }] = await sql`SELECT COUNT(*)::int AS count FROM products`;
    const [{ count: totalS }] = await sql`SELECT COUNT(*)::int AS count FROM suppliers`;
    return res.status(200).json({ ok: true, seeded, totals: { products: totalP, suppliers: totalS } });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
