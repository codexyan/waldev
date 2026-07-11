"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PickedMedia {
  id: string;
  url: string;
  filename: string;
  kind: "image" | "pdf" | "document";
}

function MediaModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (m: PickedMedia) => void;
}) {
  const [items, setItems] = useState<PickedMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/media")
      .then((r) => r.json())
      .then((raw) => {
        const d = raw as { ok?: boolean; data?: PickedMedia[] };
        if (active && d.ok && d.data) setItems(d.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-xl border border-border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Pilih Media</h3>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Memuat…</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada media. Unggah dulu di menu Media.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onPick(item);
                  onClose();
                }}
                className="overflow-hidden rounded-lg border border-border text-left transition-colors hover:border-primary"
              >
                <div className="flex aspect-square items-center justify-center bg-muted">
                  {item.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <p className="truncate p-1.5 text-xs" title={item.filename}>
                  {item.filename}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Preview({ media }: { media: PickedMedia }) {
  return media.kind === "image" ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={media.url} alt={media.filename} className="h-full w-full object-cover" />
  ) : (
    <FileText className="h-8 w-8 text-muted-foreground" />
  );
}

export function MediaPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PickedMedia | null;
  onChange: (m: PickedMedia | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
          {value ? <Preview media={value} /> : <span className="text-xs text-muted-foreground">—</span>}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
            Pilih
          </Button>
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              Hapus
            </Button>
          ) : null}
        </div>
      </div>
      {open ? <MediaModal onClose={() => setOpen(false)} onPick={onChange} /> : null}
    </div>
  );
}

export function MediaGalleryField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PickedMedia[];
  onChange: (items: PickedMedia[]) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {value.map((m) => (
          <div key={m.id} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted">
            <Preview media={m} />
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x.id !== m.id))}
              aria-label="Hapus dari galeri"
              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-foreground"
          aria-label="Tambah media"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      {open ? (
        <MediaModal
          onClose={() => setOpen(false)}
          onPick={(m) => {
            if (!value.some((x) => x.id === m.id)) onChange([...value, m]);
          }}
        />
      ) : null}
    </div>
  );
}
