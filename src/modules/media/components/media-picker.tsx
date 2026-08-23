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
        className="border-border bg-card max-h-[80vh] w-full max-w-3xl overflow-auto rounded-xl border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Pilih Media</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {loading ? (
          <p className="text-muted-foreground py-8 text-center text-sm">Memuat…</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
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
                className="border-border hover:border-primary overflow-hidden rounded-lg border text-left transition-colors"
              >
                <div className="bg-muted flex aspect-square items-center justify-center">
                  {item.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileText className="text-muted-foreground h-8 w-8" />
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
    <FileText className="text-muted-foreground h-8 w-8" />
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
        <div className="border-border bg-muted flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border">
          {value ? (
            <Preview media={value} />
          ) : (
            <span className="text-muted-foreground text-xs">·</span>
          )}
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
          <div
            key={m.id}
            className="border-border bg-muted relative h-16 w-16 overflow-hidden rounded-lg border"
          >
            <Preview media={m} />
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x.id !== m.id))}
              aria-label="Hapus dari galeri"
              className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border-border text-muted-foreground hover:border-primary hover:text-foreground flex h-16 w-16 items-center justify-center rounded-lg border border-dashed"
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
