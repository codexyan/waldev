"use client";

import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDay, toDateInput } from "@/lib/date";
import { createAppNote, deleteAppNote, updateAppNote } from "@/modules/apps/app.actions";

export interface AppNoteItem {
  id: string;
  body: string;
  version: string | null;
  notedAt: Date;
}

/**
 * Kotak tulis catatan. Sengaja sesingkat mengetik pesan: satu isian teks, versi
 * dan tanggal opsional, dan Ctrl/⌘+Enter langsung menyimpan. Catatan yang
 * tersimpan langsung dipakai halaman aplikasi, tanpa draf.
 *
 * Dengan `appId` catatan masuk ke aplikasi itu; dengan `apps` pengguna memilih
 * aplikasinya lebih dulu (dipakai di Ringkasan).
 */
export function NoteComposer({
  appId,
  apps,
}: {
  appId?: string;
  apps?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const id = useId();
  const [selectedApp, setSelectedApp] = useState(appId ?? apps?.[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [version, setVersion] = useState("");
  const [notedAt, setNotedAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSave = Boolean(selectedApp && body.trim()) && !loading;

  async function save() {
    if (!canSave) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await createAppNote(selectedApp, {
      body,
      version: version || undefined,
      notedAt: notedAt || null,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.fieldErrors?.body?.[0] ?? res.error);
      return;
    }
    setBody("");
    setVersion("");
    setNotedAt("");
    setSaved(true);
    router.refresh();
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void save();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void save();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {apps ? (
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-app`}>Aplikasi</Label>
          <Select
            id={`${id}-app`}
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
          >
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
      <Textarea
        aria-label="Isi catatan"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          setSaved(false);
        }}
        onKeyDown={onKeyDown}
        maxLength={2000}
        placeholder="Apa yang dikerjakan atau berubah hari ini?"
        className="min-h-20"
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-28 space-y-1.5">
          <Label htmlFor={`${id}-version`}>Versi</Label>
          <Input
            id={`${id}-version`}
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            maxLength={40}
            placeholder="opsional"
          />
        </div>
        <div className="w-44 space-y-1.5">
          <Label htmlFor={`${id}-date`}>Tanggal</Label>
          <Input
            id={`${id}-date`}
            type="date"
            value={notedAt}
            onChange={(e) => setNotedAt(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={!canSave}>
          {loading ? "Menyimpan…" : "Simpan catatan"}
        </Button>
        {saved ? <span className="text-sm text-emerald-600">Tersimpan ✓</span> : null}
      </div>
      <p className="text-muted-foreground text-xs">
        Tanggal kosong berarti sekarang. Isi versi bila catatan ini sebuah rilis. Ctrl/⌘+Enter
        untuk menyimpan.
      </p>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </form>
  );
}

const ICON_BUTTON =
  "text-muted-foreground inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-40";

function NoteRow({ note }: { note: AppNoteItem }) {
  const router = useRouter();
  const id = useId();
  const originalDay = toDateInput(note.notedAt);
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(note.body);
  const [version, setVersion] = useState(note.version ?? "");
  const [notedAt, setNotedAt] = useState(originalDay);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await updateAppNote(note.id, {
      body,
      version: version || undefined,
      // Tanggal yang tidak diubah dikirim kosong supaya jam aslinya tetap.
      notedAt: notedAt !== originalDay ? notedAt || null : null,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.fieldErrors?.body?.[0] ?? res.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function onDelete() {
    if (!window.confirm("Hapus catatan ini? Tindakan tidak dapat dibatalkan.")) return;
    setBusy(true);
    const res = await deleteAppNote(note.id);
    setBusy(false);
    if (res.ok) router.refresh();
    else window.alert(res.error);
  }

  if (editing) {
    return (
      <li className="py-4">
        <form onSubmit={onSave} className="space-y-3">
          <Textarea
            aria-label="Isi catatan"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            className="min-h-20"
            required
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-28 space-y-1.5">
              <Label htmlFor={`${id}-version`}>Versi</Label>
              <Input
                id={`${id}-version`}
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                maxLength={40}
              />
            </div>
            <div className="w-44 space-y-1.5">
              <Label htmlFor={`${id}-date`}>Tanggal</Label>
              <Input
                id={`${id}-date`}
                type="date"
                value={notedAt}
                onChange={(e) => setNotedAt(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" disabled={busy || !body.trim()}>
              {busy ? "Menyimpan…" : "Simpan"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setBody(note.body);
                setVersion(note.version ?? "");
                setNotedAt(originalDay);
                setError(null);
              }}
            >
              Batal
            </Button>
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">{formatDay(note.notedAt)}</span>
          {note.version ? <Badge variant="outline">{note.version}</Badge> : null}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line">{note.body}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={busy}
          aria-label="Sunting catatan"
          className={`${ICON_BUTTON} hover:bg-muted hover:text-foreground`}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          aria-label="Hapus catatan"
          className={`${ICON_BUTTON} hover:bg-destructive/10 hover:text-destructive`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

export function AppNotesList({ notes }: { notes: AppNoteItem[] }) {
  if (notes.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Belum ada catatan. Catatan pertama membuat aplikasi ini terlihat hidup di arsip.
      </p>
    );
  }
  return (
    <ul className="divide-border divide-y">
      {notes.map((note) => (
        <NoteRow key={note.id} note={note} />
      ))}
    </ul>
  );
}
