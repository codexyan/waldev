import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Point {
  icon: LucideIcon;
  title: string;
  body: string;
}

/**
 * Daftar poin: ikon kecil beraksen, judul pendek, satu paragraf penjelas.
 *
 * Menggantikan pola lama berupa kisi berbingkai dengan sel yang berubah warna
 * saat kursor lewat. Poin-poin ini tidak bisa diklik, jadi memberinya bingkai
 * dan efek sentuh hanya menjanjikan interaksi yang tidak pernah ada.
 */
export function PointList({
  points,
  columns = 1,
  className,
}: {
  points: Point[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  /* Kelas kolom ditulis utuh: Tailwind tidak memindai nama kelas yang
     dirangkai saat runtime. */
  const grid = {
    1: "",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
  }[columns];

  return (
    <ul className={cn("grid gap-x-10 gap-y-8", grid, className)}>
      {points.map((point) => (
        <li key={point.title}>
          <h3 className="display-sm flex items-center gap-2 text-[0.9375rem]">
            <point.icon className="text-link h-4 w-4 shrink-0" aria-hidden />
            {point.title}
          </h3>
          <p className="text-muted-foreground mt-2 leading-relaxed">{point.body}</p>
        </li>
      ))}
    </ul>
  );
}
