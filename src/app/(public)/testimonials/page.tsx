import type { Metadata } from "next";
import { CtaPanel } from "@/components/cta-panel";
import { PageHeader } from "@/components/page-header";
import { listPublishedTestimonials } from "@/modules/testimonials/testimonial.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Testimoni",
  description: "Cerita klien tentang pengalaman bekerja sama dengan WalDev.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPublicPage() {
  const rows = await listPublishedTestimonials();

  return (
    <>
      <PageHeader
        eyebrow="Testimoni"
        title={["Penilaian jujur", "dari klien kami."]}
        marked="klien kami."
        description="Kami hanya menampilkan testimoni yang ditulis sendiri oleh klien, tanpa dipoles ulang."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-10">
        {rows.length === 0 ? (
          <p className="text-muted-foreground">Belum ada testimoni yang ditampilkan.</p>
        ) : (
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((testimonial, index) => (
              <figure
                key={`${testimonial.authorName}-${index}`}
                className="flex flex-col justify-between border-t border-border pt-7"
                data-reveal
                style={{ transitionDelay: `${(index % 3) * 80}ms` }}
              >
                <div>
                  {testimonial.rating ? (
                    <div className="flex gap-1" aria-label={`Nilai ${testimonial.rating} dari 5`}>
                      {Array.from({ length: 5 }).map((_, star) => (
                        <span
                          key={star}
                          aria-hidden
                          className={
                            star < (testimonial.rating ?? 0)
                              ? "h-1.5 w-6 bg-signal"
                              : "h-1.5 w-6 bg-border"
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                  <blockquote className="display-sm mt-6 text-balance text-lg leading-snug">
                    “{testimonial.content}”
                  </blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-3">
                  {testimonial.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={testimonial.photoUrl}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-sm font-medium">
                      {testimonial.authorName.charAt(0)}
                    </span>
                  )}
                  <span>
                    <span className="block text-sm font-medium">{testimonial.authorName}</span>
                    <span className="label-mono mt-1 block text-muted-foreground">
                      {[testimonial.authorRole, testimonial.company].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <CtaPanel
          title="Siap menjadi cerita berikutnya?"
          body="Ceritakan kebutuhan Anda, kami kerjakan dengan proses dan standar yang sama seperti proyek proyek di atas."
        />
      </section>
    </>
  );
}
