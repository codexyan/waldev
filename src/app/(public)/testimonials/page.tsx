import type { Metadata } from "next";
import { Quote } from "lucide-react";
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
      <header className="max-w-2xl" data-reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Testimoni</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Testimonials</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Cerita dari klien yang telah bekerja sama.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="mt-16 text-muted-foreground">Belum ada testimoni.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((t, i) => (
            <figure
              key={`${t.authorName}-${i}`}
              className="card-lift flex flex-col rounded-xl border border-border bg-card p-6"
              data-reveal
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <Quote className="h-5 w-5 text-primary/50" aria-hidden />
                {t.rating ? (
                  <div className="text-sm text-amber-500" aria-label={`${t.rating} dari 5`}>
                    {"★".repeat(t.rating)}
                    <span className="text-muted-foreground/40">{"★".repeat(5 - t.rating)}</span>
                  </div>
                ) : null}
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                “{t.content}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                {t.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.photoUrl}
                    alt={t.authorName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
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
