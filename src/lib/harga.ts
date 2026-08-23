/**
 * Mengubah harga bebas-teks dari CMS ("Mulai Rp5jt", "Rp1,5jt", "Rp1.500.000")
 * menjadi angka rupiah, supaya harga termurah bisa dicari.
 *
 * Dipakai untuk memilih angka yang ditampilkan di hero beranda. Sebelumnya
 * hero memakai `.find()` yang mengambil layanan PERTAMA menurut urutan CMS,
 * bukan yang termurah — sehingga hero bisa berkata "Mulai Rp5jt" padahal
 * daftar tepat di bawahnya memuat Rp3jt.
 *
 * Mengembalikan Infinity bila tidak terbaca, agar nilai yang tidak jelas
 * tidak pernah menang saat diurutkan.
 */
export function nominalHarga(harga: string): number {
  const cocok = /([\d.,]+)\s*(jt|juta|rb|ribu)?/i.exec(harga);
  if (!cocok) return Infinity;

  // Titik sebagai pemisah ribuan dibuang; koma diperlakukan sebagai desimal,
  // sehingga "Rp1,5jt" tetap 1,5 juta dan tidak melompat jadi 15 juta.
  const angka = Number(cocok[1]!.replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));
  if (!Number.isFinite(angka)) return Infinity;

  const satuan = cocok[2] ?? "";
  if (/jt|juta/i.test(satuan)) return angka * 1_000_000;
  if (/rb|ribu/i.test(satuan)) return angka * 1_000;
  return angka;
}

/** Harga termurah di antara layanan yang benar-benar mencantumkan nominal rupiah. */
export function hargaTermurah(layanan: { price?: string | null }[]): string | undefined {
  return layanan
    .filter((item): item is { price: string } => Boolean(item.price && /rp/i.test(item.price)))
    .sort((a, b) => nominalHarga(a.price) - nominalHarga(b.price))[0]?.price;
}
