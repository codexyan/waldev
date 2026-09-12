import { buttonVariants } from "@/components/ui/button";
import { StaticLink } from "@/components/ui/static-link";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="site flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="label text-link">Kesalahan 404</p>
      <p className="display mt-6 text-[clamp(4rem,18vw,10rem)] leading-none">404</p>
      <h1 className="display-sm mt-6 text-xl sm:text-2xl">Halaman ini tidak ditemukan</h1>
      <p className="text-muted-foreground mt-3 max-w-md leading-relaxed text-pretty">
        Tautannya mungkin sudah berubah, atau halamannya sudah tidak tersedia.
      </p>
      <div className="mt-8">
        <StaticLink href="/" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
          Lihat semua aplikasi
        </StaticLink>
      </div>
    </main>
  );
}
