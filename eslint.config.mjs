import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Konfigurasi flat asli.
 *
 * Sebelumnya berkas ini memakai `FlatCompat` dari @eslint/eslintrc untuk
 * membungkus konfigurasi gaya lama. Sejak eslint-config-next 16 konfigurasinya
 * sudah flat, dan `package.json` miliknya tidak lagi mengekspos "./package.json"
 * — jalur yang justru dibaca FlatCompat saat memvalidasi. Akibatnya `eslint .`
 * mati total dengan "Converting circular structure to JSON", sehingga lint
 * tidak pernah benar-benar jalan di proyek ini.
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "drizzle/**",
      "node_modules/**",
      // Dihasilkan ulang oleh `wrangler types`; menyunting isinya sia-sia.
      "cloudflare-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
