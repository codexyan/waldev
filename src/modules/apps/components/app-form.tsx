"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RepeatableFields, type RepeatableRow } from "@/components/ui/repeatable-fields";
import { Select } from "@/components/ui/select";
import { ADMIN_BASE } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { statusLabel } from "@/lib/status";
import { createApp, updateApp } from "@/modules/apps/app.actions";
import { APP_STATUSES, type AppStatus } from "@/modules/apps/app.schema";
import {
  MediaGalleryField,
  MediaPickerField,
  type PickedMedia,
} from "@/modules/media/components/media-picker";
import { SeoFields, type SeoValue } from "@/modules/seo/components/seo-fields";

export interface AppFormInitial {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  descriptionJson: unknown;
  status: AppStatus;
  isPublished: boolean;
  appUrl: string;
  repoUrl: string;
  videoUrl: string;
  startedAt: string;
  releasedAt: string;
  retiredAt: string;
  technologies: string;
  features: RepeatableRow[];
  cover: PickedMedia | null;
  gallery: PickedMedia[];
  guideJson: unknown;
  faqs: RepeatableRow[];
  showGuide: boolean;
  showFaq: boolean;
  showNotes: boolean;
  showReleases: boolean;
  seo: SeoValue;
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-destructive text-xs">{errors[0]}</p>;
}

function Hint({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-xs">{children}</p>;
}

/** Kelompok isian bertajuk, supaya formulir yang panjang tetap terbaca per bagian. */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-border bg-card space-y-5 rounded-xl border p-5">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="border-input mt-0.5 h-4 w-4 shrink-0 rounded"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="text-muted-foreground mt-0.5 block text-xs">{hint}</span> : null}
      </span>
    </label>
  );
}

export function AppForm({ initial }: { initial: AppFormInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);

  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [tagline, setTagline] = useState(initial.tagline);
  const [description, setDescription] = useState<unknown>(initial.descriptionJson);
  const [status, setStatus] = useState<AppStatus>(initial.status);
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [appUrl, setAppUrl] = useState(initial.appUrl);
  const [repoUrl, setRepoUrl] = useState(initial.repoUrl);
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [startedAt, setStartedAt] = useState(initial.startedAt);
  const [releasedAt, setReleasedAt] = useState(initial.releasedAt);
  const [retiredAt, setRetiredAt] = useState(initial.retiredAt);
  const [technologies, setTechnologies] = useState(initial.technologies);
  const [features, setFeatures] = useState<RepeatableRow[]>(initial.features);
  const [cover, setCover] = useState<PickedMedia | null>(initial.cover);
  const [gallery, setGallery] = useState<PickedMedia[]>(initial.gallery);
  const [guide, setGuide] = useState<unknown>(initial.guideJson);
  const [faqs, setFaqs] = useState<RepeatableRow[]>(initial.faqs);
  const [showGuide, setShowGuide] = useState(initial.showGuide);
  const [showFaq, setShowFaq] = useState(initial.showFaq);
  const [showNotes, setShowNotes] = useState(initial.showNotes);
  const [showReleases, setShowReleases] = useState(initial.showReleases);
  const [seo, setSeo] = useState<SeoValue>(initial.seo);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);

    const payload = {
      name,
      slug: slug || undefined,
      tagline: tagline || undefined,
      descriptionJson: description,
      status,
      isPublished,
      appUrl: appUrl || undefined,
      repoUrl: repoUrl || undefined,
      videoUrl: videoUrl || undefined,
      coverMediaId: cover?.id,
      galleryMediaIds: gallery.map((g) => g.id),
      startedAt: startedAt || null,
      // Isian yang tidak tampil untuk status ini tidak ikut dikirim.
      releasedAt: status === "building" ? null : releasedAt || null,
      retiredAt: status === "retired" ? retiredAt || null : null,
      technologies: technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      features: features
        .map((f) => ({ title: (f.title ?? "").trim(), description: (f.description ?? "").trim() }))
        .filter((f) => f.title),
      guideJson: guide,
      faqs: faqs
        .map((f) => ({ question: (f.question ?? "").trim(), answer: (f.answer ?? "").trim() }))
        .filter((f) => f.question && f.answer),
      showGuide,
      showFaq,
      showNotes,
      showReleases,
      metaTitle: seo.metaTitle || undefined,
      metaDescription: seo.metaDescription || undefined,
      noIndex: seo.noIndex,
    };

    const res = isEdit ? await updateApp(initial.id as string, payload) : await createApp(payload);

    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      setFieldErrors(res.fieldErrors ?? {});
      return;
    }
    if (!isEdit) {
      // Langsung ke halaman sunting: di sana kotak catatan pertama menunggu.
      router.push(`${ADMIN_BASE}/apps/${res.data.id}/edit`);
      return;
    }
    setSlug(res.data.slug);
    setSaved(true);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      onChange={() => setSaved(false)}
      className="grid gap-6 lg:grid-cols-[1fr_20rem]"
    >
      <div className="space-y-6">
        <Section title="Dasar" description="Nama dan satu kalimat inilah yang tampil di daftar arsip beranda.">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama aplikasi</Label>
            <Input id="name" value={name} onChange={(e) => onNameChange(e.target.value)} required />
            <FieldError errors={fieldErrors.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tagline">Satu kalimat ringkasan</Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={200}
              placeholder="mis. Undangan digital dengan RSVP untuk setiap tamu."
            />
            <FieldError errors={fieldErrors.tagline} />
          </div>
        </Section>

        <Section title="Penjelasan & fitur">
          <div className="space-y-1.5">
            <Label>Penjelasan lengkap</Label>
            <TiptapEditor value={description} onChange={setDescription} />
          </div>
          <RepeatableFields
            label="Fitur utama"
            addLabel="Tambah fitur"
            fields={[
              { key: "title", label: "Nama fitur" },
              { key: "description", label: "Penjelasan singkat (opsional)", type: "textarea" },
            ]}
            value={features}
            onChange={setFeatures}
          />
        </Section>

        <Section
          title="Media"
          description="Tangkapan layar tetap jadi bukti walau suatu hari aplikasinya tidak aktif lagi."
        >
          <MediaPickerField label="Tangkapan layar utama" value={cover} onChange={setCover} />
          <MediaGalleryField label="Galeri" value={gallery} onChange={setGallery} />
          <div className="space-y-1.5">
            <Label htmlFor="videoUrl">Video YouTube</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
            />
            <Hint>Opsional. Pemutarnya baru dimuat saat pengunjung mengklik.</Hint>
            <FieldError errors={fieldErrors.videoUrl} />
          </div>
        </Section>

        <Section
          title="Bagian opsional"
          description="Hanya tampil di halaman aplikasi bila dinyalakan dan ada isinya."
        >
          <div className="space-y-4">
            <Toggle
              id="showGuide"
              label="Panduan pemakaian"
              checked={showGuide}
              onChange={setShowGuide}
            />
            {showGuide ? <TiptapEditor value={guide} onChange={setGuide} /> : null}
          </div>
          <div className="space-y-4">
            <Toggle id="showFaq" label="FAQ" checked={showFaq} onChange={setShowFaq} />
            {showFaq ? (
              <RepeatableFields
                label="Tanya jawab"
                addLabel="Tambah pertanyaan"
                fields={[
                  { key: "question", label: "Pertanyaan" },
                  { key: "answer", label: "Jawaban", type: "textarea" },
                ]}
                value={faqs}
                onChange={setFaqs}
              />
            ) : null}
          </div>
          <Toggle
            id="showNotes"
            label="Catatan pembuatan"
            hint={
              isEdit
                ? "Catatan pendek dan artikel terkait, ditulis dari kotak Catatan di atas."
                : "Catatan pendek dan artikel terkait. Kotak catatan muncul setelah aplikasi dibuat."
            }
            checked={showNotes}
            onChange={setShowNotes}
          />
          <Toggle
            id="showReleases"
            label="Catatan rilis"
            hint="Catatan yang diberi nomor versi."
            checked={showReleases}
            onChange={setShowReleases}
          />
        </Section>
      </div>

      <aside className="space-y-5">
        <div className="border-border bg-card space-y-4 rounded-xl border p-5">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as AppStatus)}
            >
              {APP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </Select>
          </div>
          <Toggle
            id="isPublished"
            label="Tayang di situs"
            hint="Matikan untuk draf, atau aplikasi yang berhenti sebelum sempat rilis."
            checked={isPublished}
            onChange={setIsPublished}
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Menyimpan…" : isEdit ? "Simpan" : "Buat"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(`${ADMIN_BASE}/apps`)}>
              {isEdit ? "Kembali" : "Batal"}
            </Button>
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {saved ? <p className="text-sm text-emerald-600">Tersimpan ✓</p> : null}
        </div>

        <div className="border-border bg-card space-y-4 rounded-xl border p-5">
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="otomatis-dari-nama"
            />
            <Hint>Alamat halaman: /apps/{slug || "…"}</Hint>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startedAt">Mulai dibangun</Label>
            <Input
              id="startedAt"
              type="date"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
            />
            <FieldError errors={fieldErrors.startedAt} />
          </div>
          {status !== "building" ? (
            <div className="space-y-1.5">
              <Label htmlFor="releasedAt">Tanggal rilis</Label>
              <Input
                id="releasedAt"
                type="date"
                value={releasedAt}
                onChange={(e) => setReleasedAt(e.target.value)}
              />
              <Hint>Kosong = diisi hari ini saat disimpan.</Hint>
              <FieldError errors={fieldErrors.releasedAt} />
            </div>
          ) : null}
          {status === "retired" ? (
            <div className="space-y-1.5">
              <Label htmlFor="retiredAt">Tanggal pensiun</Label>
              <Input
                id="retiredAt"
                type="date"
                value={retiredAt}
                onChange={(e) => setRetiredAt(e.target.value)}
              />
              <Hint>Kosong = diisi hari ini saat disimpan.</Hint>
              <FieldError errors={fieldErrors.retiredAt} />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="appUrl">Tautan aplikasi</Label>
            <Input
              id="appUrl"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              placeholder="https://"
            />
            <Hint>Tombol Buka aplikasi disembunyikan otomatis saat status Pensiun.</Hint>
            <FieldError errors={fieldErrors.appUrl} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="repoUrl">Kode sumber</Label>
            <Input
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/…"
            />
            <FieldError errors={fieldErrors.repoUrl} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="technologies">Teknologi</Label>
            <Input
              id="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="pisahkan dengan koma"
            />
          </div>
        </div>
        <SeoFields value={seo} onChange={setSeo} />
      </aside>
    </form>
  );
}
