// Frontend API helper — talks to Vercel Serverless Functions (/api/*).
// Every call FAILS FAST when the backend/DB isn't configured, so the UI
// automatically falls back to local demo data (buyer can click around
// even before Neon is connected).

async function req(path, options) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(path, { ...options, signal: ctrl.signal });
    if (!r.ok) throw new Error("api " + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

const json = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  products: () => req("/api/products"),
  suppliers: () => req("/api/suppliers"),

  // New items carry a huge Date.now() id → POST. Small DB ids → PUT.
  saveProduct(p) {
    if (p.id && Number(p.id) < 1000000) return req(`/api/products?id=${p.id}`, json("PUT", p));
    const { id, ...rest } = p;
    return req("/api/products", json("POST", rest));
  },
  deleteProduct: (id) => req(`/api/products?id=${id}`, { method: "DELETE" }),

  saveSupplier(s) {
    const { id, ...rest } = s;
    return req("/api/suppliers", json("POST", rest));
  },
  deleteSupplier: (id) => req(`/api/suppliers?id=${id}`, { method: "DELETE" }),
};
