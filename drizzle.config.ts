import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/infrastructure/src/db/schema.ts",
  out: "./netlify/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL ?? "postgresql://localhost:5432/living_sites",
  },
});
