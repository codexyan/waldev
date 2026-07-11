import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          Digital Studio
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
          {SITE.tagline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {SITE.description}
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/collaboration">
            <Button size="lg">Start a Project</Button>
          </Link>
          <Link href="/portfolio">
            <Button size="lg" variant="outline">
              Lihat Portfolio
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
