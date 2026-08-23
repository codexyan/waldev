import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Tautan lanjut bergaya "Selengkapnya →".
 *
 * Satu-satunya bentuk tautan aksi di seluruh situs: teks biru, panah kecil
 * yang bergeser sedikit saat disentuh kursor. Dipakai berulang supaya
 * pengunjung mengenali "ini bisa diklik" tanpa harus membaca ulang.
 */
export function ArrowLink({
  href,
  children,
  className,
  external = false,
  back = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  /** Panah dipindah ke kiri untuk tautan "kembali ke daftar". */
  back?: boolean;
}) {
  const classes = cn(
    "group text-link hover:text-link-hover inline-flex items-center gap-1.5 font-medium transition-colors",
    className,
  );
  const arrow = back ? (
    <ArrowLeft
      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
      aria-hidden
    />
  ) : (
    <ArrowRight
      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
      aria-hidden
    />
  );
  const inner = back ? (
    <>
      {arrow}
      {children}
    </>
  ) : (
    <>
      {children}
      {arrow}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
