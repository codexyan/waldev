"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  order: number;
  logo: PickedMedia | null;
}

export function ClientManager({ clients }: { clients: ClientItem[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isNda, setIsNda] = useState(false);
  const [order, setOrder] = useState("0");
  const [logo, setLogo] = useState<PickedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setEditingId(null);
    setName("");
    setWebsiteUrl("");
    setIsNda(false);
    setOrder("0");
    setLogo(null);
    setError(null);
  }

  function startEdit(c: ClientItem) {
    setEditingId(c.id);
    setName(c.name);
    setWebsiteUrl(c.websiteUrl);
    setIsNda(c.isNda);
    setOrder(String(c.order));
    setLogo(c.logo);
    setError(null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      name,
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
      <form onSubmit={onSubmit} className="border-border bg-card space-y-4 rounded-xl border p-5">
        <p className="text-sm font-medium">{editingId ? "Sunting klien" : "Klien baru"}</p>
        <div className="space-y-1.5">
          <MediaPickerField label="Logo" value={logo} onChange={setLogo} />
          <p className="text-muted-foreground text-xs">
            Pakai gambar berlatar transparan dengan logo berwarna gelap. Di beranda logo dibuat
            pudar, dan warnanya dibalik pada tema gelap.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-name">Nama</Label>
          <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required />
          <p className="text-muted-foreground text-xs">
            Jadi teks alternatif logo, atau tampil sebagai teks selama logo belum ada.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-web">Situs web</Label>
          <Input
            id="c-web"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://"
          />
          <p className="text-muted-foreground text-xs">Opsional. Bila diisi, logo menaut ke sini.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isNda}
              onChange={(e) => setIsNda(e.target.checked)}
              className="h-4 w-4"
            />
            NDA, jangan tampilkan di situs
          </label>
          <div className="flex items-center gap-2">
            <Label htmlFor="c-order" className="text-xs">
              Urutan
            </Label>
            <Input
              id="c-order"
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="h-8 w-20"
            />
          </div>
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
        {clients.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada klien.</p>
        ) : (
          clients.map((c) => (
            <div
              key={c.id}
              className="border-border flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="border-border bg-muted flex h-10 w-10 items-center justify-center overflow-hidden rounded border">
                  {c.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo.url} alt={c.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-muted-foreground text-xs">·</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  {c.isNda ? <Badge variant="warning">NDA</Badge> : null}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  aria-label={`Sunting ${c.name}`}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  aria-label={`Hapus ${c.name}`}
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
