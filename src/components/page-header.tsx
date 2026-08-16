import { LineReveal } from "@/components/motion/line-reveal";
import { Eyebrow } from "@/components/ui/section-heading";

/**
 * Kepala halaman bergaya editorial: eyebrow monospace, judul display yang
 * naik dari balik topeng, lalu deskripsi singkat.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  marked,
  children,
}: {
  eyebrow: string;
  /** Satu baris atau beberapa baris judul. */
  title: string | string[];
  description?: string;
  marked?: string;
  children?: React.ReactNode;
}) {
  const lines = Array.isArray(title) ? title : [title];

  return (
    <header className="bg-noise relative overflow-hidden border-b border-border">
      <div aria-hidden className="bg-grid absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-14 sm:pt-20 lg:px-10">
        <div className="animate-fade-up">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h1 className="display mt-8 max-w-4xl text-[clamp(2.25rem,6.5vw,4.75rem)] leading-[0.98]">
          <LineReveal lines={lines} marked={marked} />
        </h1>
        {description ? (
          <p className="animate-fade-up mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground [animation-delay:420ms]">
            {description}
          </p>
        ) : null}
        {children ? (
          <div className="animate-fade-up mt-10 [animation-delay:520ms]">{children}</div>
        ) : null}
      </div>
    </header>
  );
}
