import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-noise relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div aria-hidden className="bg-grid absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="animate-drift h-96 w-96 rounded-full bg-signal/15 blur-[130px]" />
      </div>

      <div className="relative">
        <p className="label-mono animate-fade-up inline-flex items-center gap-2 text-muted-foreground">
          <span aria-hidden className="h-2 w-2 bg-signal" />
          Kesalahan 404
        </p>
        <p className="display animate-fade-up mt-8 text-[clamp(5rem,22vw,14rem)] leading-[0.8] [animation-delay:80ms]">
          404
        </p>
        <h1 className="display-sm animate-fade-up mt-8 text-2xl [animation-delay:180ms] sm:text-3xl">
          Halaman ini tidak ditemukan
        </h1>
        <p className="animate-fade-up mx-auto mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground [animation-delay:260ms]">
          Tautannya mungkin sudah berubah atau halamannya telah dipindahkan. Mari kembali ke jalur
          yang benar.
        </p>
        <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-6 [animation-delay:340ms]">
          <Link href="/">
            <Button size="lg" className="group">
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Kembali ke beranda
            </Button>
          </Link>
          <Link href="/portfolio" className="link-sweep text-sm font-medium">
            Lihat karya kami
          </Link>
        </div>
      </div>
    </main>
  );
}
