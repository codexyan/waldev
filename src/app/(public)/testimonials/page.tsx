import type { Metadata } from "next";
import { listPublishedTestimonials } from "@/modules/testimonials/testimonial.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Apa kata klien tentang bekerja sama dengan WalDev.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPublicPage() {
  const rows = await listPublishedTestimonials();

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Testimoni</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Testimonials</h1>
        <p className="mt-3 text-muted-foreground">Cerita dari klien yang telah bekerja sama.</p>
      </header>

      {rows.length === 0 ? (
        <p className="mt-16 text-muted-foreground">Belum ada testimoni.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((t, i) => (
            <figure key={`${t.authorName}-${i}`} className="flex flex-col rounded-xl border border-border bg-card p-6">
              {t.rating ? (
                <div className="text-sm text-amber-500" aria-label={`${t.rating} dari 5`}>
                  {"★".repeat(t.rating)}
                  <span className="text-muted-foreground">{"★".repeat(5 - t.rating)}</span>
                </div>
              ) : null}
              <blockquote className="mt-3 flex-1 text-sm text-muted-foreground">
                “{t.content}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                {t.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photoUrl} alt={t.authorName} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {t.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{t.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {[t.authorRole, t.company].filter(Boolean).join(", ")}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
