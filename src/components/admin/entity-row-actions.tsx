"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { ActionResult } from "@/lib/action";

/** Aksi baris tabel admin generik: link edit + tombol hapus (server action via prop). */
export function EntityRowActions({
  id,
  editHref,
  onDelete,
  confirmText = "Hapus item ini? Tindakan tidak dapat dibatalkan.",
}: {
  id: string;
  editHref: string;
  onDelete: (id: string) => Promise<ActionResult>;
  confirmText?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    const res = await onDelete(id);
    setBusy(false);
    if (res.ok) router.refresh();
    else window.alert(res.error);
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={editHref}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        aria-label="Hapus"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
