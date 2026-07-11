import type { Metadata } from "next";
import { CollaborationForm } from "@/modules/leads/components/collaboration-form";

export const metadata: Metadata = {
  title: "Start a Project",
  description: "Ceritakan kebutuhan Anda — mari bangun produk digital bersama WalDev.",
  alternates: { canonical: "/collaboration" },
};

export default function CollaborationPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Start a Project</h1>
        <p className="mt-3 text-muted-foreground">
          Isi formulir berikut dan tim kami akan menghubungi Anda untuk membahas kebutuhan proyek.
        </p>
      </header>
      <CollaborationForm />
    </section>
  );
}
