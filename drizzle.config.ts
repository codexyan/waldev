import { defineConfig } from "drizzle-kit";

// `db:generate` menghasilkan file migrasi SQL dari schema Drizzle ke ./drizzle.
// Migrasi diterapkan ke D1 via `wrangler d1 migrations apply` (lihat scripts).
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
});
