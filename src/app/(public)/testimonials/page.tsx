import type { Metadata } from "next";
import { CtaPanel } from "@/components/cta-panel";
import { PageHeader } from "@/components/page-header";
import { RatingBars } from "@/components/rating-bars";
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
        description="Kami hanya menampilkan testimoni yang ditulis sendiri oleh klien, tanpa dipoles ulang."
      />

      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        {rows.length === 0 ? (
          <p className="text-muted-foreground">Belum ada testimoni yang ditampilkan.</p>
        ) : (
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((testimonial, index) => (
              <figure key={`${testimonial.authorName}-${index}`} className="flex flex-col">
                {testimonial.rating ? <RatingBars rating={testimonial.rating} /> : null}
                <blockquote className="text-muted-foreground mt-4 flex-1 leading-relaxed text-pretty">
                  “{testimonial.content}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {testimonial.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={testimonial.photoUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="bg-surface flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-medium"
                    >
                      {testimonial.authorName.charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="text-heading block truncate font-medium">
                      {testimonial.authorName}
                    </span>
                    <span className="text-faint block truncate text-xs">
                      {[testimonial.authorRole, testimonial.company].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-4 sm:pt-24">
        <CtaPanel
          title="Siap menjadi cerita berikutnya?"
          body="Ceritakan kebutuhan Anda, kami kerjakan dengan proses dan standar yang sama seperti proyek proyek di atas."
        />
      </section>
    </>
  );
}
