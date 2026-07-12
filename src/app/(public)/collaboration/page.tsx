import type { Metadata } from "next";
import { CollaborationForm } from "@/modules/leads/components/collaboration-form";

export const metadata: Metadata = {
  title: "Start a Project",
  description: "Ceritakan kebutuhan Anda dan mari bangun produk digital bersama WalDev.",
  alternates: { canonical: "/collaboration" },
};

export default function CollaborationPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Kolaborasi</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Start a Project</h1>
        <p className="mt-3 text-muted-foreground">
          Isi formulir berikut dan tim kami akan menghubungi Anda untuk membahas kebutuhan proyek.
        </p>
      </header>
      <CollaborationForm />
    </section>
  );
}
