import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/server/db/client";
import * as schema from "@/server/db/schema";

/** Secrets disediakan via .dev.vars / `wrangler secret put` (tidak diemit oleh `wrangler types`). */
type AuthSecrets = {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
};

/**
 * Membuat instance Better Auth per-request (bindings D1 & secrets edge-scoped).
 * Tanpa registrasi publik — akun admin dibuat oleh Owner via CMS (fase Users).
 */
export function getAuth() {
  const db = getDb();
  const { env } = getCloudflareContext();
  const secrets = env as unknown as AuthSecrets;

  return betterAuth({
    baseURL: secrets.BETTER_AUTH_URL,
    secret: secrets.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 hari
      updateAge: 60 * 60 * 24, // refresh tiap 24 jam
    },
  });
}

export type Auth = ReturnType<typeof getAuth>;
