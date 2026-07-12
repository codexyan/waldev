"use client";

import { useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  FileText,
  Globe,
  HelpCircle,
  LayoutDashboard,
  Loader2,
  Paperclip,
  Puzzle,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitCollaboration } from "@/modules/leads/lead.actions";

/* ------------------------- Pilihan terpandu (wizard) ------------------------ */

const PROJECT_TYPES: { id: string; label: string; desc: string; icon: LucideIcon }[] = [
  {
    id: "landing",
    label: "Landing Page / Company Profile",
    desc: "Website untuk memperkenalkan bisnis dan menarik pelanggan.",
    icon: Rocket,
  },
  {
    id: "website",
    label: "Website + CMS / Blog",
    desc: "Situs dengan konten yang bisa dikelola sendiri.",
    icon: Globe,
  },
  {
    id: "sistem",
    label: "Sistem Informasi / Dashboard",
    desc: "Aplikasi untuk mengelola data dan operasional.",
    icon: LayoutDashboard,
  },
  {
    id: "ai",
    label: "AI / Otomasi",
    desc: "Chatbot, integrasi AI, atau alur kerja otomatis.",
    icon: Bot,
  },
  {
    id: "custom",
    label: "Aplikasi Custom",
    desc: "Kebutuhan khusus di luar kategori di atas.",
    icon: Puzzle,
  },
  {
    id: "unsure",
    label: "Belum Yakin",
    desc: "Ceritakan saja masalahnya, kami bantu tentukan solusinya.",
    icon: HelpCircle,
  },
];

const GOALS = [
  "Meningkatkan penjualan",
  "Branding & kredibilitas",
  "Efisiensi operasional",
  "Digitalisasi proses manual",
  "Layanan pelanggan lebih baik",
];

const AUDIENCES = [
  "Pelanggan umum",
  "Tim internal",
  "Klien & mitra bisnis",
  "Instansi / organisasi",
];

const FEATURES = [
  "Formulir & pengumpulan lead",
  "Pembayaran online",
  "Login & akun pengguna",
  "Dashboard admin",
  "Notifikasi email / WhatsApp",
  "Laporan & grafik",
  "Integrasi dengan sistem lain",
  "Chatbot / AI",
  "Upload & arsip dokumen",
];

const BUDGETS = [
  "Di bawah Rp5 juta",
  "Rp5 sampai 15 juta",
  "Rp15 sampai 50 juta",
  "Di atas Rp50 juta",
  "Belum tahu, butuh saran",
];

const TIMELINES = ["Kurang dari 1 bulan", "1 sampai 2 bulan", "3 sampai 6 bulan", "Fleksibel"];

const STEPS = ["Jenis", "Tujuan", "Fitur", "Anggaran", "Kontak"];

/* --------------------------------- Helpers -------------------------------- */

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all",
        active
          ? "border-primary/50 bg-primary/10 font-medium text-primary"
          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
      )}
    >
      {active ? <Check className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}

function StepTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

/* ---------------------------------- Form ----------------------------------- */

export function CollaborationForm() {
  const [step, setStep] = useState(0);
  const [projectType, setProjectType] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [problem, setProblem] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureNotes, setFeatureNotes] = useState("");
  const [reference, setReference] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", whatsapp: "", company: "" });

  const [token, setToken] = useState<string | undefined>(undefined);
  const [attachmentId, setAttachmentId] = useState<string | undefined>(undefined);
  const [attachmentName, setAttachmentName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const typeLabel = PROJECT_TYPES.find((t) => t.id === projectType)?.label ?? "";

  function stepValid(s: number): boolean {
    if (s === 0) return projectType !== "";
    if (s === 1) return problem.trim().length >= 10;
    return true;
  }

  function next() {
    if (!stepValid(step)) {
      setError(
        step === 0
          ? "Pilih dulu jenis proyeknya."
          : "Ceritakan singkat masalah atau kebutuhan Anda (min. 10 karakter).",
      );
      return;
    }
    setError(null);
    setStep((v) => Math.min(v + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((v) => Math.max(v - 1, 0));
  }

  /** Susun jawaban wizard menjadi brief proyek (PRD ringkas). */
  function composeBrief(): string {
    const sections: string[] = ["BRIEF PROYEK", ""];
    sections.push(`Jenis proyek: ${typeLabel}`);
    if (goals.length > 0) sections.push(`Tujuan utama: ${goals.join(", ")}`);
    if (audiences.length > 0) sections.push(`Pengguna utama: ${audiences.join(", ")}`);
    sections.push("", "Masalah / kebutuhan:", problem.trim());
    if (features.length > 0) {
      sections.push("", "Fitur yang dibutuhkan:");
      for (const f of features) sections.push(`- ${f}`);
    }
    if (featureNotes.trim()) sections.push("", "Catatan tambahan:", featureNotes.trim());
    if (reference.trim()) sections.push("", `Referensi: ${reference.trim()}`);
    if (budget) sections.push("", `Perkiraan anggaran: ${budget}`);
    if (timeline) sections.push(`Target waktu: ${timeline}`);
    return sections.join("\n").slice(0, 5000);
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await submitCollaboration({
      name: contact.name,
      email: contact.email,
      whatsapp: contact.whatsapp,
      company: contact.company,
      budget,
      deadline: timeline,
      projectType: typeLabel,
      description: composeBrief(),
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
      <div className="py-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">Brief Anda telah terkirim</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Jawaban Anda sudah tersusun menjadi brief proyek dan diterima tim kami. Kami akan
          menghubungi Anda dalam 1x24 jam kerja.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {/* Stepper */}
      <ol className="flex items-center gap-1.5" aria-label="Langkah pengisian">
        {STEPS.map((label, i) => {
          const isDone = i < step;
          const isCurrent = i === step;
          return (
            <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-px flex-1",
                    i === 0 ? "bg-transparent" : isDone || isCurrent ? "bg-primary/50" : "bg-border",
                  )}
                />
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "h-px flex-1",
                    i === STEPS.length - 1 ? "bg-transparent" : isDone ? "bg-primary/50" : "bg-border",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[11px]",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Konten step (key memicu ulang animasi masuk) */}
      <div key={step} className="animate-fade-up mt-8 space-y-6">
        {step === 0 ? (
          <>
            <StepTitle
              title="Apa yang ingin Anda bangun?"
              hint="Pilih yang paling mendekati. Tidak harus tepat, kami bantu pertajam nanti."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {PROJECT_TYPES.map((t) => {
                const active = projectType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setProjectType(t.id);
                      setError(null);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "relative rounded-xl border p-4 text-left transition-all",
                      active
                        ? "border-primary/50 bg-primary/5"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    {active ? (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg border",
                        active
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-muted/50 text-muted-foreground",
                      )}
                    >
                      <t.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <p className="mt-3 text-sm font-medium tracking-tight">{t.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <StepTitle
              title="Apa tujuannya?"
              hint="Pilih yang sesuai (boleh lebih dari satu), lalu ceritakan singkat."
            />
            <div className="space-y-2">
              <Label>Tujuan utama</Label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <Chip key={g} active={goals.includes(g)} onClick={() => setGoals(toggle(goals, g))}>
                    {g}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Siapa penggunanya?</Label>
              <div className="flex flex-wrap gap-2">
                {AUDIENCES.map((a) => (
                  <Chip
                    key={a}
                    active={audiences.includes(a)}
                    onClick={() => setAudiences(toggle(audiences, a))}
                  >
                    {a}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="problem">Masalah atau kebutuhan yang ingin diselesaikan *</Label>
              <Textarea
                id="problem"
                className="min-h-28"
                placeholder="Contoh: pencatatan pesanan masih manual di buku, sering selisih dan sulit membuat laporan bulanan."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <StepTitle
              title="Fitur apa saja yang terbayang?"
              hint="Centang yang sekiranya dibutuhkan. Lewati saja jika belum terbayang."
            />
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <Chip
                  key={f}
                  active={features.includes(f)}
                  onClick={() => setFeatures(toggle(features, f))}
                >
                  {f}
                </Chip>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="featureNotes">Fitur lain atau catatan (opsional)</Label>
              <Textarea
                id="featureNotes"
                className="min-h-20"
                value={featureNotes}
                onChange={(e) => setFeatureNotes(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reference">Referensi yang disukai (opsional)</Label>
                <Input
                  id="reference"
                  placeholder="Tautan website atau aplikasi"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attachment">Lampiran (opsional)</Label>
                <label
                  htmlFor="attachment"
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Paperclip className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {uploading ? "Mengunggah..." : attachmentName || "Pilih file"}
                  </span>
                </label>
                <input
                  id="attachment"
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                  onChange={onFile}
                  className="sr-only"
                />
              </div>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <StepTitle
              title="Anggaran dan waktu"
              hint="Perkiraan saja, bukan angka final. Ini membantu kami menyusun opsi yang pas."
            />
            <div className="space-y-2">
              <Label>Perkiraan anggaran</Label>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <Chip key={b} active={budget === b} onClick={() => setBudget(budget === b ? "" : b)}>
                    {b}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target selesai</Label>
              <div className="flex flex-wrap gap-2">
                {TIMELINES.map((tl) => (
                  <Chip
                    key={tl}
                    active={timeline === tl}
                    onClick={() => setTimeline(timeline === tl ? "" : tl)}
                  >
                    {tl}
                  </Chip>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <StepTitle
              title="Terakhir, kontak Anda"
              hint="Brief di bawah tersusun otomatis dari jawaban Anda dan ikut terkirim."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama *</Label>
                <Input
                  id="name"
                  required
                  value={contact.name}
                  onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={contact.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={contact.whatsapp}
                  onChange={(e) => setContact((c) => ({ ...c, whatsapp: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Perusahaan / usaha</Label>
                <Input
                  id="company"
                  value={contact.company}
                  onChange={(e) => setContact((c) => ({ ...c, company: e.target.value }))}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <FileText className="h-3.5 w-3.5" />
                Ringkasan brief Anda
              </p>
              <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                {composeBrief().replace(/^BRIEF PROYEK\n\n/, "")}
              </p>
            </div>

            <TurnstileWidget onVerify={setToken} />
          </>
        ) : null}
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      {/* Navigasi step */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={back}>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>
            Lanjut
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim
              </>
            ) : (
              <>
                Kirim Brief
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
