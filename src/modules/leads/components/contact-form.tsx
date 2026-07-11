"use client";

import { useState, type FormEvent } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/modules/leads/lead.actions";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [token, setToken] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await submitContact({ ...form, turnstileToken: token });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight">Pesan terkirim</h2>
        <p className="mt-2 text-sm text-muted-foreground">Terima kasih, kami akan segera membalas.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c-name">Nama *</Label>
          <Input id="c-name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-email">Email *</Label>
          <Input id="c-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-subject">Subjek</Label>
        <Input id="c-subject" value={form.subject} onChange={(e) => set("subject", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-message">Pesan *</Label>
        <Textarea
          id="c-message"
          className="min-h-32"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          required
        />
      </div>
      <TurnstileWidget onVerify={setToken} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Mengirim…" : "Kirim Pesan"}
      </Button>
    </form>
  );
}
