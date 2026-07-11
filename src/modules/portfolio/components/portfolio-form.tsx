"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RepeatableFields, type RepeatableRow } from "@/components/ui/repeatable-fields";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_BASE } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import {
  MediaGalleryField,
  MediaPickerField,
  type PickedMedia,
} from "@/modules/media/components/media-picker";
import { createPortfolio, updatePortfolio } from "@/modules/portfolio/portfolio.actions";
import { PORTFOLIO_STATUSES, type PortfolioStatus } from "@/modules/portfolio/portfolio.schema";
import { SeoFields, type SeoValue } from "@/modules/seo/components/seo-fields";

export interface PortfolioFormInitial {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  challenge: string;
  solution: string;
  timeline: string;
  status: PortfolioStatus;
  clientId: string;
  demoUrl: string;
  repoUrl: string;
  order: string;
  isConfidential: boolean;
  technologies: string;
  features: RepeatableRow[];
  thumbnail: PickedMedia | null;
  cover: PickedMedia | null;
  gallery: PickedMedia[];
  seo: SeoValue;
}

export function PortfolioForm({
  initial,
  clients,
}: {
  initial: PortfolioFormInitial;
  clients: { id: string; name: string }[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [summary, setSummary] = useState(initial.summary);
  const [challenge, setChallenge] = useState(initial.challenge);
  const [solution, setSolution] = useState(initial.solution);
  const [timeline, setTimeline] = useState(initial.timeline);
  const [status, setStatus] = useState<PortfolioStatus>(initial.status);
  const [clientId, setClientId] = useState(initial.clientId);
  const [demoUrl, setDemoUrl] = useState(initial.demoUrl);
  const [repoUrl, setRepoUrl] = useState(initial.repoUrl);
  const [order, setOrder] = useState(initial.order);
  const [isConfidential, setIsConfidential] = useState(initial.isConfidential);
  const [technologies, setTechnologies] = useState(initial.technologies);
  const [features, setFeatures] = useState<RepeatableRow[]>(initial.features);
  const [thumbnail, setThumbnail] = useState<PickedMedia | null>(initial.thumbnail);
  const [cover, setCover] = useState<PickedMedia | null>(initial.cover);
  const [gallery, setGallery] = useState<PickedMedia[]>(initial.gallery);
  const [seo, setSeo] = useState<SeoValue>(initial.seo);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title,
      slug: slug || undefined,
      summary: summary || undefined,
      challenge: challenge || undefined,
      solution: solution || undefined,
      timeline: timeline || undefined,
      status,
      clientId: clientId || undefined,
      demoUrl: demoUrl || undefined,
      repoUrl: repoUrl || undefined,
      order,
      isConfidential,
      thumbnailMediaId: thumbnail?.id,
      coverMediaId: cover?.id,
      galleryMediaIds: gallery.map((g) => g.id),
      technologies: technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      features: features
        .map((f) => ({ title: (f.title ?? "").trim(), description: (f.description ?? "").trim() }))
        .filter((f) => f.title),
      metaTitle: seo.metaTitle || undefined,
      metaDescription: seo.metaDescription || undefined,
      noIndex: seo.noIndex,
    };

    const res = isEdit
      ? await updatePortfolio(initial.id as string, payload)
      : await createPortfolio(payload);

    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(`${ADMIN_BASE}/portfolio`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Judul</Label>
          <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="summary">Ringkasan</Label>
          <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="challenge">Challenge</Label>
          <Textarea id="challenge" value={challenge} onChange={(e) => setChallenge(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="solution">Solution</Label>
          <Textarea id="solution" value={solution} onChange={(e) => setSolution(e.target.value)} />
        </div>
        <RepeatableFields
          label="Features"
          addLabel="Tambah fitur"
          fields={[
            { key: "title", label: "Judul fitur" },
            { key: "description", label: "Deskripsi (opsional)", type: "textarea" },
          ]}
          value={features}
          onChange={setFeatures}
        />
        <MediaGalleryField label="Galeri" value={gallery} onChange={setGallery} />
      </div>

      <aside className="space-y-5">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as PortfolioStatus)}>
              {PORTFOLIO_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client">Klien</Label>
            <Select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">— Tanpa klien —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Confidential (sembunyikan klien)
          </label>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Menyimpan…" : isEdit ? "Simpan" : "Buat"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(`${ADMIN_BASE}/portfolio`)}>
              Batal
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <MediaPickerField label="Thumbnail" value={thumbnail} onChange={setThumbnail} />
          <MediaPickerField label="Cover" value={cover} onChange={setCover} />
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="otomatis-dari-judul"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timeline">Timeline</Label>
            <Input id="timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="mis. 6 minggu" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tech">Tech stack</Label>
            <Input
              id="tech"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="pisahkan dengan koma"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="demo">Demo URL</Label>
            <Input id="demo" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="repo">Repository URL</Label>
            <Input id="repo" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="order">Urutan</Label>
            <Input id="order" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
          </div>
        </div>
        <SeoFields value={seo} onChange={setSeo} />
      </aside>
    </form>
  );
}
