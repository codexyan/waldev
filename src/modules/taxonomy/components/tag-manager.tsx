"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTagAction, deleteTagAction } from "@/modules/taxonomy/taxonomy.actions";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export function TagManager({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createTagAction({ name });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setName("");
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!window.confirm("Hapus tag ini?")) return;
    const res = await deleteTagAction(id);
    if (res.ok) router.refresh();
    else window.alert(res.error);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama tag baru"
          className="max-w-xs"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "…" : "Tambah"}
        </Button>
      </form>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {tags.length === 0 ? (
        <p className="text-muted-foreground text-sm">Belum ada tag.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t.id}
              className="border-border inline-flex items-center gap-2 rounded-full border py-1 pr-1 pl-3 text-sm"
            >
              {t.name}
              <button
                type="button"
                onClick={() => onDelete(t.id)}
                aria-label={`Hapus ${t.name}`}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive inline-flex h-5 w-5 items-center justify-center rounded-full"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
