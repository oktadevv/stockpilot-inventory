# StockPilot — Inventory Management System

Modern, minimal inventory management web app for retail stores & minimarkets. Built with **React + Vite + Tailwind CSS + Lucide Icons + Recharts**, hosted on **Vercel**, database on **Neon (PostgreSQL)**.

**Live demo:**  https://stockpilot-inventory-rust.vercel.app

## Demo login

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@stockpilot.io` | `admin123` |
| Store Clerk | any email | min. 6 chars |

OTP step is simulated — any 6-digit code works.

## Demo notes (honest limitations)

- Auth is client-side demo mode: any valid-looking email + 6-char password signs in, no real session.
- Currency is USD ($), store timezone America/Los_Angeles, POS tax 10%.
- Export buttons download real CSV files; the Reports PDF button opens the browser print dialog.
- Daily Sales Ledger + charts use static demo figures; inventory/supplier data is live from Neon.

## Features

- 🔐 Admin login (show/hide password, Remember Me, OTP, role switcher)
- 📊 Dashboard (stock / low-stock / sales / revenue cards + sales trend chart + category donut)
- 📦 Inventory table (search, category + status filters, bulk actions, add/edit/delete/restock modals, barcode-scan placeholder)
- 🛒 POS & stock control (barcode simulator, cart, tax, payment methods, quick stock adjustments)
- 🚚 Supplier management · 📈 Sales reports · ⚙️ Admin settings
- 🌙 Full dark / light mode · 📱 Fully responsive

## Run locally

```bash
npm install
npm run dev        # → http://localhost:5173
```

Optional local DB: copy `.env.example` to `.env` and fill `DATABASE_URL`.

## Deploy to Vercel + Neon

1. **Neon** — create a free project at [console.neon.tech](https://console.neon.tech), copy the **pooled** connection string.
2. **GitHub** — push this repo.
3. **Vercel** — Import the repo (Framework Preset: **Vite**). Add env var:
   - `DATABASE_URL` = your Neon pooled connection string (all environments)
4. Deploy, then open **`/api/seed` once** to create tables + demo data.
   (Seeded on 2026-09-23; the endpoint file was deleted afterwards for security.)
5. (Done) `api/seed.js` deleted and redeployed, so nobody can re-seed the database.

Without `DATABASE_URL` the app still runs fully on built-in demo data (badge shows “Demo data”; with DB connected it shows “Neon Live”).

## Project structure

```
├── api/                # Vercel serverless functions (Neon Postgres)
│   ├── _db.js          # shared client (not an endpoint)
│   ├── products.js     # GET/POST/PUT/DELETE /api/products
│   └── suppliers.js    # GET/POST/DELETE /api/suppliers
│                       # (seed.js was a one-time setup endpoint, deleted after seeding)
├── db/schema.sql       # DDL (alternative: run in Neon SQL Editor)
├── src/
│   ├── App.jsx         # all screens & components
│   ├── api.js          # frontend fetch helper (falls back to demo data)
│   └── data.js         # demo dataset + seed source
└── vercel.json         # Vite build config for Vercel
```
