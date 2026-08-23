/** Satu fakta pendek yang menjawab pertanyaan pembeli. */
export interface Fact {
  value: string;
  label: string;
}

/**
 * Tiga angka kunci dalam satu kotak: berapa, berapa lama, dan seberapa cepat
 * dibalas.
 *
 * Menggantikan empat angka raksasa lama yang sebenarnya hanya menghitung
 * baris tabel ("4 proyek dipublikasikan", "6 bidang layanan", "5 tahap proses
 * kerja") — angka yang naik turun mengikuti isi CMS dan tidak pernah menjadi
 * alasan siapa pun menghubungi studio.
 */
export function Stats({ facts }: { facts: Fact[] }) {
  return (
    <dl className="divide-border border-border grid divide-y overflow-hidden rounded-xl border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {facts.map((fact) => (
        <div key={fact.label} className="bg-card px-6 py-7">
          <dd className="display text-2xl sm:text-[1.75rem]">{fact.value}</dd>
          <dt className="text-muted-foreground mt-2">{fact.label}</dt>
        </div>
      ))}
    </dl>
  );
}
