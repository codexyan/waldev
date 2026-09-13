/**
 * Menerima kiriman formulir kontak (docs/09 §5.4) langsung di Worker, sebelum Next.js.
 *
 * Halaman publik berupa berkas statis dan Worker berjalan di paket Workers Free (CPU 10 ms
 * per permintaan). Route handler Next.js bisa terkena Error 1102, jadi `worker.mjs`
 * meneruskan `POST /api/kontak` ke fungsi ringan ini: cek asal kiriman, jebakan bot,
 * validasi, batas kiriman per jaringan, lalu satu INSERT ke `contact_messages`.
 *
 * Formulir dengan JavaScript mengirim JSON dan menerima JSON. Tanpa JavaScript, formulir
 * terkirim sebagai POST biasa lalu dialihkan ke /kontak/terkirim atau /kontak/gagal.
 */

export const CONTACT_PATH = "/api/kontak";

/** Kiriman per alamat IP dalam satu jam. */
const BATAS_PER_JAM = 5;
const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Balasan = { ok: true } | { ok: false; error: string };

function teks(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function balas(viaFetch: boolean, status: number, body: Balasan): Response {
  if (viaFetch) return Response.json(body, { status });
  return new Response(null, {
    status: 303,
    headers: { Location: body.ok ? "/kontak/terkirim" : "/kontak/gagal" },
  });
}

/** Peramban selalu mengirim Origin pada POST; kiriman dari situs lain ditolak. */
function asalSama(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function handleContactRequest(request: Request, env: CloudflareEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Metode tidak diizinkan.", { status: 405, headers: { Allow: "POST" } });
  }
  if (!asalSama(request)) {
    return new Response("Asal kiriman tidak diizinkan.", { status: 403 });
  }

  const viaFetch = (request.headers.get("content-type") ?? "").includes("application/json");
  let data: Record<string, unknown>;
  try {
    data = viaFetch
      ? ((await request.json()) as Record<string, unknown>)
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return balas(viaFetch, 400, { ok: false, error: "Isian formulir tidak bisa dibaca." });
  }

  // Jebakan bot: kolom `website` tersembunyi dari pengunjung. Bila terisi, balasannya tetap
  // "berhasil" supaya bot tidak mencoba cara lain, tetapi pesannya tidak disimpan.
  if (teks(data.website, 200)) return balas(viaFetch, 200, { ok: true });

  const name = teks(data.name, 100);
  const email = teks(data.email, 254);
  const message = teks(data.message, 5000);
  if (!name) return balas(viaFetch, 400, { ok: false, error: "Nama wajib diisi." });
  if (!POLA_EMAIL.test(email)) {
    return balas(viaFetch, 400, { ok: false, error: "Alamat email belum benar." });
  }
  if (message.length < 10) {
    return balas(viaFetch, 400, { ok: false, error: "Pesan terlalu pendek. Tulis minimal 10 karakter." });
  }

  const kunci = `kontak:${request.headers.get("cf-connecting-ip") ?? "tanpa-ip"}`;
  const terpakai = Number((await env.CACHE_KV.get(kunci)) ?? "0");
  if (terpakai >= BATAS_PER_JAM) {
    return balas(viaFetch, 429, {
      ok: false,
      error: "Terlalu banyak pesan dari jaringan ini. Coba lagi dalam satu jam.",
    });
  }

  try {
    await env.DB.prepare(
      "INSERT INTO contact_messages (id, name, email, subject, message, status, created_at) VALUES (?1, ?2, ?3, NULL, ?4, 'new', ?5)",
    )
      .bind(crypto.randomUUID(), name, email, message, Math.floor(Date.now() / 1000))
      .run();
  } catch {
    return balas(viaFetch, 500, {
      ok: false,
      error: "Pesan belum tersimpan. Coba lagi beberapa saat lagi.",
    });
  }

  await env.CACHE_KV.put(kunci, String(terpakai + 1), { expirationTtl: 3600 });
  return balas(viaFetch, 200, { ok: true });
}
