"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_BASE } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { createArticle, updateArticle } from "@/modules/articles/article.actions";
import { ARTICLE_STATUSES, type ArticleStatus } from "@/modules/articles/article.schema";
import { MediaPickerField, type PickedMedia } from "@/modules/media/components/media-picker";

export interface ArticleFormInitial {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  categoryId: string;
  tags: string;
  status: ArticleStatus;
  scheduledAt: string;
  contentJson: unknown;
  cover: PickedMedia | null;
}

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

export function ArticleForm({
  initial,
  categories,
}: {
  initial: ArticleFormInitial;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [summary, setSummary] = useState(initial.summary);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [tags, setTags] = useState(initial.tags);
  const [status, setStatus] = useState<ArticleStatus>(initial.status);
  const [scheduledAt, setScheduledAt] = useState(initial.scheduledAt);
  const [cover, setCover] = useState<PickedMedia | null>(initial.cover);
  const [content, setContent] = useState<unknown>(initial.contentJson);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [loading, setLoading] = useState(false);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      title,
      slug: slug || undefined,
      summary: summary || undefined,
      coverMediaId: cover?.id,
      contentJson: content,
      categoryId: categoryId || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status,
      scheduledAt: scheduledAt || undefined,
    };

    const res = isEdit
      ? await updateArticle(initial.id as string, payload)
      : await createArticle(payload);

    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      setFieldErrors(res.fieldErrors ?? {});
      return;
    }
    router.push(`${ADMIN_BASE}/articles`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Judul</Label>
          <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} required />
          <FieldError errors={fieldErrors.title} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="summary">Ringkasan</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Ringkasan singkat untuk daftar & SEO"
          />
          <FieldError errors={fieldErrors.summary} />
        </div>

        <div className="space-y-1.5">
          <Label>Konten</Label>
          <TiptapEditor value={content} onChange={setContent} />
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as ArticleStatus)}>
              {ARTICLE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>

          {status === "scheduled" ? (
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt">Jadwal terbit</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <FieldError errors={fieldErrors.scheduledAt} />
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Menyimpan…" : isEdit ? "Simpan" : "Buat"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`${ADMIN_BASE}/articles`)}
            >
              Batal
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
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
            <FieldError errors={fieldErrors.slug} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Kategori</Label>
            <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">— Tanpa kategori —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="pisahkan dengan koma"
            />
          </div>
        </div>
      </aside>
    </form>
  );
}
