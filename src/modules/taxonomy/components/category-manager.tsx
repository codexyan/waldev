"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/modules/taxonomy/taxonomy.actions";
import { CATEGORY_TYPES, type CategoryType } from "@/modules/taxonomy/taxonomy.schema";

interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description: string | null;
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("article");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setEditingId(null);
    setName("");
    setType("article");
    setSlug("");
    setDescription("");
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setName(c.name);
    setType(c.type);
    setSlug(c.slug);
    setDescription(c.description ?? "");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = { name, type, slug: slug || undefined, description: description || undefined };
    const res = editingId
      ? await updateCategoryAction(editingId, payload)
      : await createCategoryAction(payload);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    reset();
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!window.confirm("Hapus kategori ini?")) return;
    const res = await deleteCategoryAction(id);
    if (res.ok) router.refresh();
    else window.alert(res.error);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium">{editingId ? "Edit kategori" : "Kategori baru"}</p>
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">Nama</Label>
          <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-type">Tipe</Label>
          <Select id="cat-type" value={type} onChange={(e) => setType(e.target.value as CategoryType)}>
            {CATEGORY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-slug">Slug (opsional)</Label>
          <Input id="cat-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="otomatis" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-desc">Deskripsi</Label>
          <Textarea id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
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
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada kategori.</p>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.type} · /{c.slug}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  aria-label="Edit"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  aria-label="Hapus"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
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
