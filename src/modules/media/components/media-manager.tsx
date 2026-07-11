"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMediaAction } from "@/modules/media/media.actions";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  kind: "image" | "pdf" | "document";
  createdAt: Date;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaManager({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/media", { method: "POST", body: fd });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (!res.ok || !data.ok) {
      setError(data.error ?? "Gagal mengunggah.");
      return;
    }
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!window.confirm("Hapus media ini?")) return;
    const res = await deleteMediaAction(id);
    if (res.ok) router.refresh();
    else window.alert(res.error);
  }

  function copyUrl(url: string) {
    const full = `${window.location.origin}${url}`;
    void navigator.clipboard?.writeText(full);
    setCopied(url);
    window.setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.txt"
          onChange={onUpload}
          className="hidden"
          id="media-upload"
        />
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Mengunggah…" : "Unggah Media"}
        </Button>
        <span className="text-xs text-muted-foreground">Maks 10MB · gambar, PDF, dokumen</span>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Belum ada media.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex aspect-video items-center justify-center bg-muted">
                {item.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium" title={item.filename}>
                  {item.filename}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatBytes(item.size)}</p>
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => copyUrl(item.url)}
                    className="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Copy className="h-3 w-3" />
                    {copied === item.url ? "Tersalin" : "URL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    aria-label="Hapus"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
