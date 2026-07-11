"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { ADMIN_BASE } from "@/lib/constants";
import { deleteArticle } from "@/modules/articles/article.actions";

export function ArticleRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!window.confirm("Hapus artikel ini? Tindakan tidak dapat dibatalkan.")) return;
    setBusy(true);
    const res = await deleteArticle(id);
    setBusy(false);
    if (res.ok) router.refresh();
    else window.alert(res.error);
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`${ADMIN_BASE}/articles/${id}/edit`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        aria-label="Hapus"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
