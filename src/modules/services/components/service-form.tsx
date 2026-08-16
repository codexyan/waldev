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
import { createService, updateService } from "@/modules/services/service.actions";
import { SERVICE_STATUSES, type ServiceStatus } from "@/modules/services/service.schema";
import { SeoFields, type SeoValue } from "@/modules/seo/components/seo-fields";
import { statusLabel } from "@/lib/status";

export interface ServiceFormInitial {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  ctaLabel: string;
  ctaUrl: string;
  status: ServiceStatus;
  order: string;
  features: RepeatableRow[];
  workflow: RepeatableRow[];
  faqs: RepeatableRow[];
  seo: SeoValue;
}

export function ServiceForm({ initial }: { initial: ServiceFormInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);

  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(initial.price);
  const [ctaLabel, setCtaLabel] = useState(initial.ctaLabel);
  const [ctaUrl, setCtaUrl] = useState(initial.ctaUrl);
  const [status, setStatus] = useState<ServiceStatus>(initial.status);
  const [order, setOrder] = useState(initial.order);
  const [features, setFeatures] = useState<RepeatableRow[]>(initial.features);
  const [workflow, setWorkflow] = useState<RepeatableRow[]>(initial.workflow);
  const [faqs, setFaqs] = useState<RepeatableRow[]>(initial.faqs);
  const [seo, setSeo] = useState<SeoValue>(initial.seo);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      slug: slug || undefined,
      description: description || undefined,
      price: price || undefined,
      ctaLabel: ctaLabel || undefined,
      ctaUrl: ctaUrl || undefined,
      status,
      order,
      features: features
        .map((f) => ({ title: (f.title ?? "").trim(), description: (f.description ?? "").trim() }))
        .filter((f) => f.title),
      workflow: workflow
        .map((w) => ({ title: (w.title ?? "").trim(), description: (w.description ?? "").trim() }))
        .filter((w) => w.title),
      faqs: faqs
        .map((f) => ({ question: (f.question ?? "").trim(), answer: (f.answer ?? "").trim() }))
        .filter((f) => f.question && f.answer),
      metaTitle: seo.metaTitle || undefined,
      metaDescription: seo.metaDescription || undefined,
      noIndex: seo.noIndex,
    };

    const res = isEdit
      ? await updateService(initial.id as string, payload)
      : await createService(payload);

    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(`${ADMIN_BASE}/services`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama layanan</Label>
          <Input id="name" value={name} onChange={(e) => onNameChange(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-32"
          />
        </div>
        <RepeatableFields
          label="Fitur"
          addLabel="Tambah fitur"
          fields={[
            { key: "title", label: "Judul fitur" },
            { key: "description", label: "Deskripsi (opsional)", type: "textarea" },
          ]}
          value={features}
          onChange={setFeatures}
        />
        <RepeatableFields
          label="Workflow"
          addLabel="Tambah langkah"
          fields={[
            { key: "title", label: "Judul langkah" },
            { key: "description", label: "Deskripsi (opsional)", type: "textarea" },
          ]}
          value={workflow}
          onChange={setWorkflow}
        />
        <RepeatableFields
          label="FAQ"
          addLabel="Tambah FAQ"
          fields={[
            { key: "question", label: "Pertanyaan" },
            { key: "answer", label: "Jawaban", type: "textarea" },
          ]}
          value={faqs}
          onChange={setFaqs}
        />
      </div>

      <aside className="space-y-5">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as ServiceStatus)}>
              {SERVICE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Menyimpan…" : isEdit ? "Simpan" : "Buat"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(`${ADMIN_BASE}/services`)}>
              Batal
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Harga (opsional)</Label>
            <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="mis. Mulai Rp5jt" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ctaLabel">CTA label</Label>
            <Input id="ctaLabel" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Mulai Proyek" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ctaUrl">CTA URL</Label>
            <Input id="ctaUrl" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/collaboration" />
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
