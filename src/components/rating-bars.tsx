/**
 * Nilai testimoni sebagai lima bilah.
 *
 * Bilah kosong dulu memakai `bg-border` (rasio 1,06:1 di mode terang, praktis
 * tak terlihat). Sekarang bilah terisi memakai warna teks dan bilah kosong
 * diberi garis dalam, sehingga perbedaannya lolos WCAG 1.4.11 (3:1) di kedua
 * tema. Nilai numeriknya tetap diumumkan lewat aria-label pada wadah.
 */
export function RatingBars({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, rating));

  return (
    <div role="img" aria-label={`Nilai ${value} dari 5`} className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          aria-hidden
          className={
            index < value
              ? "bg-foreground h-1.5 w-6"
              : "bg-foreground/10 ring-foreground/40 h-1.5 w-6 ring-1 ring-inset"
          }
        />
      ))}
    </div>
  );
}
