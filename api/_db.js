// Shared Neon client for Vercel Serverless Functions.
// Underscore prefix = Vercel will NOT expose this file as an endpoint.
import { neon } from "@neondatabase/serverless";

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it in Vercel → Project → Settings → Environment Variables.");
  }
  return neon(process.env.DATABASE_URL);
}
