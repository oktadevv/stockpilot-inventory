// Products API → GET /api/products · POST /api/products · PUT /api/products?id= · DELETE /api/products?id=
import { getSql } from "./_db.js";

const mapRow = (r) => ({
  id: r.id, name: r.name, sku: r.sku, category: r.category,
  stock: Number(r.stock), threshold: Number(r.threshold),
  cost: Number(r.cost), price: Number(r.price),
  supplier: r.supplier, gradient: r.gradient, icon: r.icon,
});

export default async function handler(req, res) {
  try {
    const sql = getSql();

    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM products ORDER BY id ASC`;
      return res.status(200).json(rows.map(mapRow));
    }

    if (req.method === "POST") {
      const b = req.body || {};
      if (!b.name || !b.sku) return res.status(400).json({ error: "name & sku required" });
      const rows = await sql`
        INSERT INTO products (name, sku, category, stock, threshold, cost, price, supplier, gradient, icon)
        VALUES (${b.name}, ${b.sku}, ${b.category || "Beverages"}, ${b.stock ?? 0}, ${b.threshold ?? 20},
                ${b.cost ?? 0}, ${b.price ?? 0}, ${b.supplier || ""},
                ${b.gradient || "from-primary-500 to-indigo-700"}, ${b.icon || "Package"})
        ON CONFLICT (sku) DO UPDATE SET
          name = EXCLUDED.name, category = EXCLUDED.category, stock = EXCLUDED.stock,
          threshold = EXCLUDED.threshold, cost = EXCLUDED.cost, price = EXCLUDED.price,
          supplier = EXCLUDED.supplier
        RETURNING *`;
      return res.status(200).json(mapRow(rows[0]));
    }

    if (req.method === "PUT") {
      const b = req.body || {};
      const rows = await sql`
        UPDATE products SET name = ${b.name}, sku = ${b.sku}, category = ${b.category},
          stock = ${b.stock}, threshold = ${b.threshold}, cost = ${b.cost},
          price = ${b.price}, supplier = ${b.supplier}
        WHERE id = ${Number(req.query.id)} RETURNING *`;
      if (!rows.length) return res.status(404).json({ error: "not found" });
      return res.status(200).json(mapRow(rows[0]));
    }

    if (req.method === "DELETE") {
      await sql`DELETE FROM products WHERE id = ${Number(req.query.id)}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
