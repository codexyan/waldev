import type { ComponentProps } from "react";

/**
 * Tautan internal situs publik sebagai `<a>` biasa, bukan `next/link`.
 *
 * Halaman publik disajikan sebagai berkas statis (scripts/terbitkan.mjs) karena paket
 * Workers Free membatasi CPU 10 ms per permintaan. `next/link` melakukan prefetch dan
 * pindah halaman lewat permintaan RSC yang selalu menjalankan Worker, jadi di sini
 * perpindahan halaman cukup memuat berkas HTML statis berikutnya.
 */
export function StaticLink(props: ComponentProps<"a">) {
  return <a {...props} />;
}
