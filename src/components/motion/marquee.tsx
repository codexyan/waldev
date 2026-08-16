import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Pita berjalan tanpa henti. Isi digandakan dua kali agar putarannya mulus,
 * dan berhenti saat kursor berada di atasnya.
 */
export function Marquee({
  items,
  duration = 38,
  reverse = false,
  className,
}: {
  items: string[];
  /** Durasi satu putaran dalam detik. */
  duration?: number;
  reverse?: boolean;
  className?: string;
}) {
  const track = (
    <div
      className="marquee__track"
      style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
    >
      {items.map((item) => (
        <span key={item} className="flex items-center gap-10 whitespace-nowrap">
          <span className="display-sm text-2xl sm:text-3xl">{item}</span>
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      aria-hidden
      className={cn("marquee", reverse && "marquee--reverse", className)}
    >
      {track}
      {track}
    </div>
  );
}
