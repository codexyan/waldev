"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPickerField, type PickedMedia } from "@/modules/media/components/media-picker";
import { updateSettingsAction } from "@/modules/settings/settings.actions";
import { SETTINGS_GROUPS, type SettingsKey, type SiteSettings } from "@/modules/settings/settings";

export function SettingsForm({
  initial,
  initialPhoto,
}: {
  initial: SiteSettings;
  initialPhoto: PickedMedia | null;
}) {
  const router = useRouter();
  const [values, setValues] = useState<SiteSettings>(initial);
  const [photo, setPhoto] = useState<PickedMedia | null>(initialPhoto);
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
    const res = await updateSettingsAction({ ...values, owner_photo_media_id: photo?.id ?? "" });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      {SETTINGS_GROUPS.map((group) => (
        <section
          key={group.title}
          className="border-border bg-card space-y-4 rounded-xl border p-5"
        >
          <div>
            <h2 className="text-base font-semibold">{group.title}</h2>
            {group.description ? (
              <p className="text-muted-foreground mt-1 text-sm">{group.description}</p>
            ) : null}
          </div>
          {group.fields.map((field) =>
            field.media ? (
              <MediaPickerField
                key={field.key}
                label={field.label}
                value={photo}
                onChange={(picked) => {
                  setPhoto(picked);
                  setSaved(false);
                }}
              />
            ) : (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.multiline ? (
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
                {field.hint ? (
                  <p className="text-muted-foreground text-xs">{field.hint}</p>
                ) : null}
              </div>
            ),
          )}
        </section>
      ))}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan…" : "Simpan"}
        </Button>
        {saved ? <span className="text-sm text-emerald-600">Tersimpan ✓</span> : null}
      </div>
    </form>
  );
}
