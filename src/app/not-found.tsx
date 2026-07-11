import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link href="/" className="mt-8">
        <Button>Kembali ke Beranda</Button>
      </Link>
    </main>
  );
}
