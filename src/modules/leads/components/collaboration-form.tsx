"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCollaboration } from "@/modules/leads/lead.actions";

export function CollaborationForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    company: "",
    budget: "",
    deadline: "",
    projectType: "",
    description: "",
  });
  const [token, setToken] = useState<string | undefined>(undefined);
  const [attachmentId, setAttachmentId] = useState<string | undefined>(undefined);
  const [attachmentName, setAttachmentName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/collaboration/attachment", { method: "POST", body: fd });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      data?: { id: string; filename: string };
      error?: string;
    };
    setUploading(false);
    if (res.ok && data.ok && data.data) {
      setAttachmentId(data.data.id);
      setAttachmentName(data.data.filename);
    } else {
      setError(data.error ?? "Gagal mengunggah lampiran.");
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await submitCollaboration({
      ...form,
      attachmentMediaId: attachmentId,
      turnstileToken: token,
    });
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
        <h2 className="text-xl font-semibold tracking-tight">Terima kasih!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Permintaan Anda telah kami terima. Tim kami akan menghubungi Anda secepatnya.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama *</Label>
          <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Perusahaan</Label>
          <Input id="company" value={form.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="projectType">Jenis proyek</Label>
          <Input id="projectType" value={form.projectType} onChange={(e) => set("projectType", e.target.value)} placeholder="Website, Sistem, POS…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budget">Budget</Label>
          <Input id="budget" value={form.budget} onChange={(e) => set("budget", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} placeholder="mis. 2 bulan" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Deskripsi kebutuhan *</Label>
        <Textarea
          id="description"
          className="min-h-32"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="attachment">Lampiran (opsional)</Label>
        <input
          id="attachment"
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.txt"
          onChange={onFile}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm"
        />
        {uploading ? (
          <p className="text-xs text-muted-foreground">Mengunggah…</p>
        ) : attachmentName ? (
          <p className="text-xs text-emerald-600">Terlampir: {attachmentName}</p>
        ) : null}
      </div>

      <TurnstileWidget onVerify={setToken} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Mengirim…" : "Kirim Permintaan"}
      </Button>
    </form>
  );
}
