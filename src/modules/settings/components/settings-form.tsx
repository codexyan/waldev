"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSettingsAction } from "@/modules/settings/settings.actions";
import { SETTINGS_FIELDS, type SettingsKey, type SiteSettings } from "@/modules/settings/settings";

const MULTILINE: SettingsKey[] = ["description", "footer_text"];

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [values, setValues] = useState<SiteSettings>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(key: SettingsKey, value: string) {
    setValues((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await updateSettingsAction(values);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      {SETTINGS_FIELDS.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={field.key}>{field.label}</Label>
          {MULTILINE.includes(field.key) ? (
            <Textarea
              id={field.key}
              value={values[field.key]}
              onChange={(e) => set(field.key, e.target.value)}
            />
          ) : (
            <Input
              id={field.key}
              value={values[field.key]}
              onChange={(e) => set(field.key, e.target.value)}
            />
          )}
        </div>
      ))}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan…" : "Simpan"}
        </Button>
        {saved ? <span className="text-sm text-emerald-600">Tersimpan ✓</span> : null}
      </div>
    </form>
  );
}
