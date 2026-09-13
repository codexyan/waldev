"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StaticLink } from "@/components/ui/static-link";
import { Textarea } from "@/components/ui/textarea";

type Keadaan =
  | { status: "idle"; lagi?: boolean }
  | { status: "sending" }
  | { status: "sent"; name: string }
  | { status: "error"; message: string };

const GAGAL_UMUM = "Pesan belum terkirim. Coba lagi beberapa saat lagi.";

/**
 * Formulir kontak (docs/09 §5.4), dikirim ke `/api/kontak` yang ditangani Worker sebelum
 * Next.js. Dengan JavaScript, kiriman memakai fetch dan hasilnya tampil di tempat. Tanpa
 * JavaScript, formulir tetap terkirim sebagai POST biasa lalu dialihkan ke halaman
 * konfirmasi. Kolom `website` adalah jebakan bot: tersembunyi dari pengunjung maupun
 * pembaca layar, dan kiriman yang mengisinya tidak disimpan.
 */
export function ContactForm() {
  const [state, setState] = useState<Keadaan>({ status: "idle" });
  const formulir = useRef<HTMLFormElement>(null);
  const judulTerkirim = useRef<HTMLHeadingElement>(null);

  /* Tombol kirim ikut hilang saat pesan terkirim. Fokus dipindah ke judul konfirmasi supaya
     pembaca layar membacakannya dan pengguna keyboard tidak terlempar ke awal halaman.
     "Kirim pesan lain" mengembalikan fokus ke kolom Nama. */
  useEffect(() => {
    if (state.status === "sent") judulTerkirim.current?.focus();
    if (state.status === "idle" && state.lagi) {
      const nama = formulir.current?.elements.namedItem("name");
      if (nama instanceof HTMLInputElement) nama.focus();
    }
  }, [state]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "sending") return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/kontak", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && body?.ok) {
        form.reset();
        setState({ status: "sent", name: typeof data.name === "string" ? data.name.trim() : "" });
        return;
      }
      setState({ status: "error", message: body?.error ?? GAGAL_UMUM });
    } catch {
      setState({
        status: "error",
        message: "Koneksi terputus. Periksa internet Anda lalu coba lagi.",
      });
    }
  }

  if (state.status === "sent") {
    return (
      <div className="border-border bg-card rounded-xl border p-6 sm:p-8">
        <h2
          ref={judulTerkirim}
          tabIndex={-1}
          className="display-sm text-xl focus-visible:outline-none"
        >
          Pesan terkirim
        </h2>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Terima kasih{state.name ? `, ${state.name}` : ""}. Kami membalas lewat email yang Anda
          tulis di formulir.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setState({ status: "idle", lagi: true })}
        >
          Kirim pesan lain
        </Button>
      </div>
    );
  }

  const sending = state.status === "sending";

  return (
    <form
      ref={formulir}
      action="/api/kontak"
      method="post"
      onSubmit={onSubmit}
      className="border-border bg-card relative space-y-5 rounded-xl border p-6 sm:p-8"
    >
      <div className="space-y-1.5">
        <Label htmlFor="kontak-nama">Nama</Label>
        <Input id="kontak-nama" name="name" autoComplete="name" required maxLength={100} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kontak-email">Email</Label>
        <Input
          id="kontak-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          aria-describedby="kontak-email-petunjuk"
        />
        <p id="kontak-email-petunjuk" className="text-muted-foreground text-xs">
          Balasan dikirim ke alamat ini.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kontak-pesan">Pesan</Label>
        <Textarea
          id="kontak-pesan"
          name="message"
          rows={6}
          required
          minLength={10}
          maxLength={5000}
        />
      </div>

      {/* Jebakan bot, lihat komentar di atas komponen. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="kontak-website">Situs web</label>
        <input id="kontak-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* aria-disabled, bukan disabled: tombol yang dinonaktifkan melepas fokus ke awal
            halaman, padahal pengguna keyboard perlu tetap di tombol ini bila pesannya gagal. */}
        <Button
          type="submit"
          size="lg"
          aria-disabled={sending}
          className="w-full aria-disabled:cursor-wait aria-disabled:opacity-70 sm:w-auto"
        >
          {sending ? "Mengirim…" : "Kirim pesan"}
        </Button>
        <p className="text-muted-foreground text-xs">
          Isian hanya dipakai untuk membalas pesan ini.{" "}
          <StaticLink
            href="/privacy-policy"
            className="link whitespace-nowrap underline decoration-1 underline-offset-[3px]"
          >
            Kebijakan Privasi
          </StaticLink>
        </p>
      </div>
    </form>
  );
}
