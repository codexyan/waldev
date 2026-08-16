"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createClientAction,
  deleteClientAction,
  updateClientAction,
} from "@/modules/clients/client.actions";
import { MediaPickerField, type PickedMedia } from "@/modules/media/components/media-picker";

interface ClientItem {
  id: string;
  name: string;
  slug: string;
  isNda: boolean;
  websiteUrl: string;
  categoryId: string;
  order: number;
  logo: PickedMedia | null;
}

export function ClientManager({
  clients,
  categories,
}: {
  clients: ClientItem[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isNda, setIsNda] = useState(false);
  const [order, setOrder] = useState("0");
  const [logo, setLogo] = useState<PickedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setEditingId(null);
    setName("");
    setCategoryId("");
    setWebsiteUrl("");
    setIsNda(false);
    setOrder("0");
    setLogo(null);
  }

  function startEdit(c: ClientItem) {
    setEditingId(c.id);
    setName(c.name);
    setCategoryId(c.categoryId);
    setWebsiteUrl(c.websiteUrl);
    setIsNda(c.isNda);
    setOrder(String(c.order));
    setLogo(c.logo);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      name,
      categoryId: categoryId || undefined,
      websiteUrl: websiteUrl || undefined,
      isNda,
      order,
      logoMediaId: logo?.id,
    };
    const res = editingId
      ? await updateClientAction(editingId, payload)
      : await createClientAction(payload);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    reset();
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!window.confirm("Hapus klien ini?")) return;
    const res = await deleteClientAction(id);
    if (res.ok) router.refresh();
    else window.alert(res.error);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium">{editingId ? "Edit klien" : "Klien baru"}</p>
        <MediaPickerField label="Logo" value={logo} onChange={setLogo} />
        <div className="space-y-1.5">
          <Label htmlFor="c-name">Nama</Label>
          <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-cat">Kategori</Label>
          <Select id="c-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Tanpa kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-web">Website</Label>
          <Input id="c-web" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isNda} onChange={(e) => setIsNda(e.target.checked)} className="h-4 w-4" />
            NDA
          </label>
          <div className="flex items-center gap-2">
            <Label htmlFor="c-order" className="text-xs">
              Urutan
            </Label>
            <Input id="c-order" type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="h-8 w-20" />
          </div>
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
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada klien.</p>
        ) : (
          clients.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border border-border bg-muted">
                  {c.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo.url} alt={c.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground">·</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  {c.isNda ? <Badge variant="warning">NDA</Badge> : null}
                </div>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => startEdit(c)} aria-label="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onDelete(c.id)} aria-label="Hapus" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
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
