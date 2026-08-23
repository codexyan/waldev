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
  MessageCircle,
  Paperclip,
  Plus,
  Puzzle,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Button, buttonVariants } from "@/components/ui/button";
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

/**
 * Tiga langkah, bukan lima.
 *
 * Susunan lama ("Jenis", "Tujuan", "Fitur", "Anggaran", "Kontak") menyodorkan
 * 37 pilihan sebelum seseorang bisa mengirim, padahal yang benar-benar wajib
 * hanya jenis proyek, cerita singkat, nama, dan email. Tujuan, pengguna, dan
 * fitur kini dilipat sebagai detail opsional di langkah kedua.
 */
const STEPS = ["Kebutuhan", "Anggaran", "Kontak"];

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
          ? "border-primary/50 bg-primary/10 text-primary font-medium"
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
      <p className="text-muted-foreground mt-1 text-sm">{hint}</p>
    </div>
  );
}

/* ---------------------------------- Form ----------------------------------- */

export function CollaborationForm({
  whatsappHref,
  contactEmail,
}: {
  /** Null selama nomor WhatsApp belum diisi di Site Settings. */
  whatsappHref: string | null;
  contactEmail: string | null;
}) {
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

  /** Hanya langkah pertama yang punya isian wajib; sisanya boleh dilewati. */
  function stepValid(s: number): boolean {
    if (s === 0) return projectType !== "" && problem.trim().length >= 10;
    return true;
  }

  function next() {
    if (!stepValid(step)) {
      setError(
        projectType === ""
          ? "Pilih dulu jenis proyeknya."
          : "Ceritakan singkat kebutuhan Anda, minimal 10 karakter.",
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
        <span className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-full">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">
          Kebutuhan Anda sudah kami terima
        </h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
          Jawaban Anda sudah tersusun menjadi ringkasan kebutuhan dan diterima tim kami. Kami
          menghubungi Anda dalam 1x24 jam kerja.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {/* Jalan pintas untuk yang sudah tahu kebutuhannya. Tidak semua orang
          datang untuk mengisi formulir; sebagian hanya ingin bertanya harga
          sekarang juga, dan memaksa mereka melewati lima langkah adalah cara
          tercepat kehilangan prospek yang paling siap. */}
      {whatsappHref || contactEmail ? (
        <div className="border-border bg-muted/40 mb-8 rounded-lg border p-5">
          <p className="text-sm font-medium">Sudah tahu yang Anda butuhkan?</p>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Tidak perlu mengisi formulir. Hubungi kami langsung, jawabannya sama cepatnya.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                Chat WhatsApp
              </a>
            ) : null}
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="text-muted-foreground hover:text-foreground text-sm font-medium underline underline-offset-4 transition-colors"
              >
                {contactEmail}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

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
                    i === 0
                      ? "bg-transparent"
                      : isDone || isCurrent
                        ? "bg-primary/50"
                        : "bg-border",
                  )}
                />
                {/* Langkah yang sudah dilewati bisa diklik untuk kembali.
                    Sebelumnya penanda ini hanya <span>, jadi satu-satunya cara
                    memperbaiki jawaban adalah menekan "Kembali" berulang kali. */}
                {isDone ? (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep(i);
                    }}
                    aria-label={`Kembali ke langkah ${i + 1}: ${label}`}
                    className="border-primary bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : (
                  <span
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                      isCurrent
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                )}
                <span
                  className={cn(
                    "h-px flex-1",
                    i === STEPS.length - 1
                      ? "bg-transparent"
                      : isDone
                        ? "bg-primary/50"
                        : "bg-border",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[11px]",
                  isCurrent ? "text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Konten step (key memicu ulang animasi masuk) */}
      <div key={step} className="mt-8 space-y-6">
        {step === 0 ? (
          <>
            <StepTitle
              title="Apa yang ingin Anda bangun?"
              hint="Pilih yang paling mendekati, lalu ceritakan singkat kondisinya. Dua hal ini saja sudah cukup bagi kami untuk membalas."
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
                      <span className="bg-primary text-primary-foreground absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full">
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
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{t.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label htmlFor="problem">Ceritakan singkat kebutuhan Anda *</Label>
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

        {step === 1 ? (
          <>
            <StepTitle
              title="Anggaran dan waktu"
              hint="Perkiraan saja, bukan angka final. Boleh dilewati kalau belum terbayang."
            />
            <div className="space-y-2">
              <Label>Perkiraan anggaran</Label>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <Chip
                    key={b}
                    active={budget === b}
                    onClick={() => setBudget(budget === b ? "" : b)}
                  >
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

            {/* Tujuan, pengguna, dan fitur dulu menempati dua langkah tersendiri —
                37 pilihan untuk data yang tidak satu pun wajib. Sekarang semuanya
                dilipat di sini: yang ingin memperjelas tetap bisa, yang tidak
                tinggal menekan Lanjut. */}
            <details className="group border-border rounded-lg border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                Tambahkan detail supaya penawaran lebih akurat
                <span className="border-border text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-open:rotate-45">
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                </span>
              </summary>

              <div className="border-border space-y-5 border-t p-4">
                <div className="space-y-2">
                  <Label>Tujuan utama</Label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map((g) => (
                      <Chip
                        key={g}
                        active={goals.includes(g)}
                        onClick={() => setGoals(toggle(goals, g))}
                      >
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
                  <Label>Fitur yang terbayang</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featureNotes">Catatan tambahan</Label>
                  <Textarea
                    id="featureNotes"
                    className="min-h-20"
                    value={featureNotes}
                    onChange={(e) => setFeatureNotes(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reference">Referensi yang disukai</Label>
                    <Input
                      id="reference"
                      placeholder="Tautan website atau aplikasi"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attachment">Lampiran</Label>
                    <label
                      htmlFor="attachment"
                      className="border-border text-muted-foreground hover:border-primary/40 hover:text-foreground flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 text-sm transition-colors"
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
              </div>
            </details>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <StepTitle
              title="Terakhir, kontak Anda"
              hint="Ringkasan di bawah tersusun otomatis dari jawaban Anda dan ikut terkirim."
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

            <div className="border-border bg-muted/40 rounded-xl border p-4">
              <p className="text-primary flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
                <FileText className="h-3.5 w-3.5" />
                Ringkasan kebutuhan Anda
              </p>
              <p className="text-muted-foreground mt-3 text-xs leading-relaxed whitespace-pre-line">
                {composeBrief().replace(/^BRIEF PROYEK\n\n/, "")}
              </p>
            </div>

            <TurnstileWidget onVerify={setToken} />
          </>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-destructive mt-4 text-sm">
          {error}
        </p>
      ) : null}

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
                Kirim kebutuhan saya
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
