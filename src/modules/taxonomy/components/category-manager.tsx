"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/modules/taxonomy/taxonomy.actions";
import type { CategoryType } from "@/modules/taxonomy/taxonomy.schema";

interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description: string | null;
}

/** Arsip aplikasi hanya memakai kategori untuk tulisan, jadi tipenya tidak perlu dipilih. */
const TYPE: CategoryType = "article";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description ?? "");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      name,
      type: TYPE,
      slug: slug || undefined,
      description: description || undefined,
    };
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
      <form onSubmit={onSubmit} className="border-border bg-card space-y-4 rounded-xl border p-5">
        <p className="text-sm font-medium">{editingId ? "Edit kategori" : "Kategori baru"}</p>
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">Nama</Label>
          <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-slug">Slug (opsional)</Label>
          <Input
            id="cat-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="otomatis"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-desc">Deskripsi</Label>
          <Textarea
            id="cat-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
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
          <p className="text-muted-foreground text-sm">Belum ada kategori.</p>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="border-border flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-muted-foreground text-xs">/{c.slug}</p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  aria-label="Edit"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  aria-label="Hapus"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive inline-flex h-8 w-8 items-center justify-center rounded-md"
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
