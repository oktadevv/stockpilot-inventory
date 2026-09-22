// Suppliers API → GET /api/suppliers · POST /api/suppliers · DELETE /api/suppliers?id=
import { getSql } from "./_db.js";

const mapRow = (r) => ({
  id: r.id, name: r.name, contact: r.contact, email: r.email, phone: r.phone,
  products: Number(r.products), rating: Number(r.rating),
  status: r.status, gradient: r.gradient, lastOrder: r.last_order,
});

export default async function handler(req, res) {
  try {
    const sql = getSql();

    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM suppliers ORDER BY id ASC`;
      return res.status(200).json(rows.map(mapRow));
    }

    if (req.method === "POST") {
      const b = req.body || {};
      if (!b.name) return res.status(400).json({ error: "name required" });
      const rows = await sql`
        INSERT INTO suppliers (name, contact, email, phone, products, rating, status, gradient, last_order)
        VALUES (${b.name}, ${b.contact || ""}, ${b.email || ""}, ${b.phone || ""},
                ${b.products ?? 0}, ${b.rating ?? 5.0}, ${b.status || "Active"},
                ${b.gradient || "from-primary-500 to-indigo-700"}, ${b.lastOrder || ""})
        RETURNING *`;
      return res.status(200).json(mapRow(rows[0]));
    }

    if (req.method === "DELETE") {
      await sql`DELETE FROM suppliers WHERE id = ${Number(req.query.id)}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
