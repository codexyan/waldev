"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MediaPickerField, type PickedMedia } from "@/modules/media/components/media-picker";
import {
  createTestimonialAction,
  deleteTestimonialAction,
  updateTestimonialAction,
} from "@/modules/testimonials/testimonial.actions";
import {
  TESTIMONIAL_STATUSES,
  type TestimonialStatus,
} from "@/modules/testimonials/testimonial.schema";

interface TestimonialItem {
  id: string;
  authorName: string;
  authorRole: string;
  company: string;
  content: string;
  rating: number | null;
  status: TestimonialStatus;
  clientId: string;
  order: number;
  photo: PickedMedia | null;
}

export function TestimonialManager({
  testimonials,
  clients,
}: {
  testimonials: TestimonialItem[];
  clients: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState<TestimonialStatus>("draft");
  const [clientId, setClientId] = useState("");
  const [order, setOrder] = useState("0");
  const [photo, setPhoto] = useState<PickedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setEditingId(null);
    setAuthorName("");
    setAuthorRole("");
    setCompany("");
    setContent("");
    setRating("");
    setStatus("draft");
    setClientId("");
    setOrder("0");
    setPhoto(null);
  }

  function startEdit(t: TestimonialItem) {
    setEditingId(t.id);
    setAuthorName(t.authorName);
    setAuthorRole(t.authorRole);
    setCompany(t.company);
    setContent(t.content);
    setRating(t.rating ? String(t.rating) : "");
    setStatus(t.status);
    setClientId(t.clientId);
    setOrder(String(t.order));
    setPhoto(t.photo);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      authorName,
      authorRole: authorRole || undefined,
      company: company || undefined,
      content,
      rating: rating || undefined,
      status,
      clientId: clientId || undefined,
      order,
      photoMediaId: photo?.id,
    };
    const res = editingId
      ? await updateTestimonialAction(editingId, payload)
      : await createTestimonialAction(payload);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    reset();
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!window.confirm("Hapus testimoni ini?")) return;
    const res = await deleteTestimonialAction(id);
    if (res.ok) router.refresh();
    else window.alert(res.error);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[24rem_1fr]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium">{editingId ? "Edit testimoni" : "Testimoni baru"}</p>
        <MediaPickerField label="Foto" value={photo} onChange={setPhoto} />
        <div className="space-y-1.5">
          <Label htmlFor="t-name">Nama</Label>
          <Input id="t-name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="t-role">Jabatan</Label>
            <Input id="t-role" value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-company">Perusahaan</Label>
            <Input id="t-company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-content">Isi testimoni</Label>
          <Textarea id="t-content" value={content} onChange={(e) => setContent(e.target.value)} required className="min-h-24" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="t-rating">Rating</Label>
            <Select id="t-rating" value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="">—</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-status">Status</Label>
            <Select id="t-status" value={status} onChange={(e) => setStatus(e.target.value as TestimonialStatus)}>
              {TESTIMONIAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-order">Urutan</Label>
            <Input id="t-order" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-client">Klien (opsional)</Label>
          <Select id="t-client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">—</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Menyimpan…" : editingId ? "Simpan" : "Tambah"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={reset}>
              Batal
            </Button>
          ) : null}
        </div>
      </form>

      <div className="space-y-2">
        {testimonials.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada testimoni.</p>
        ) : (
          testimonials.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-3 rounded-lg border border-border px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {t.authorName}
                  {t.company ? <span className="text-muted-foreground"> · {t.company}</span> : null}
                  {t.status === "published" ? (
                    <Badge variant="success" className="ml-2">
                      published
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2">
                      draft
                    </Badge>
                  )}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.content}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => startEdit(t)} aria-label="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onDelete(t.id)} aria-label="Hapus" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
