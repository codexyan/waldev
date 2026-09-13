"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDay } from "@/lib/date";
import { cn } from "@/lib/utils";
import { updateMessageStatusAction } from "@/modules/messages/message.actions";
import type { MessageStatus } from "@/modules/messages/message.dal";

export interface MessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  /** Milidetik sejak epoch; Date tidak dikirim langsung ke komponen klien. */
  createdAt: number;
}

const STATUS_LABEL: Record<MessageStatus, string> = {
  new: "Baru",
  read: "Dibaca",
  archived: "Diarsipkan",
};

/** Daftar pesan dari formulir kontak (docs/09 §7.5): kotak Masuk dan Arsip. */
export function MessageList({ messages }: { messages: MessageItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  const inbox = messages.filter((item) => item.status !== "archived");
  const archived = messages.filter((item) => item.status === "archived");
  const visible = showArchive ? archived : inbox;

  function change(id: string, status: MessageStatus) {
    setError(null);
    startTransition(async () => {
      const res = await updateMessageStatusAction(id, status);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Pilih kotak pesan" className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={showArchive ? "outline" : "default"}
          aria-pressed={!showArchive}
          onClick={() => setShowArchive(false)}
        >
          Masuk ({inbox.length})
        </Button>
        <Button
          type="button"
          size="sm"
          variant={showArchive ? "default" : "outline"}
          aria-pressed={showArchive}
          onClick={() => setShowArchive(true)}
        >
          Arsip ({archived.length})
        </Button>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {visible.length === 0 ? (
        <p className="border-border bg-card text-muted-foreground rounded-xl border p-6 text-sm">
          {showArchive
            ? "Belum ada pesan yang diarsipkan."
            : "Belum ada pesan masuk. Pesan dari formulir di halaman Kontak akan tampil di sini."}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <li
              key={item.id}
              className={cn(
                "border-border bg-card rounded-xl border p-5",
                item.status === "new" && "border-primary/50",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-medium">
                  {item.name}
                  <span className="text-muted-foreground ml-2 text-sm font-normal break-all">
                    {item.email}
                  </span>
                </p>
                <p className="text-muted-foreground text-xs">
                  {STATUS_LABEL[item.status]} · {formatDay(new Date(item.createdAt))}
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">{item.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`mailto:${item.email}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  Balas lewat email
                </a>
                {item.status === "new" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => change(item.id, "read")}
                  >
                    Tandai dibaca
                  </Button>
                ) : null}
                {item.status === "archived" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => change(item.id, "read")}
                  >
                    Kembalikan ke Masuk
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => change(item.id, "archived")}
                  >
                    Arsipkan
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
