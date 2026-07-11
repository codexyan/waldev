import type { Metadata } from "next";
import { ContactForm } from "@/modules/leads/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hubungi WalDev untuk pertanyaan seputar layanan dan produk digital.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-3 text-muted-foreground">
          Ada pertanyaan? Kirim pesan dan kami akan segera membalas.
        </p>
      </header>
      <ContactForm />
    </section>
  );
}
