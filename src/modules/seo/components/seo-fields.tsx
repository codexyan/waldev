"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface SeoValue {
  metaTitle: string;
  metaDescription: string;
  noIndex: boolean;
}

export function SeoFields({
  value,
  onChange,
}: {
  value: SeoValue;
  onChange: (v: SeoValue) => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-medium">SEO (opsional)</p>
      <div className="space-y-1.5">
        <Label htmlFor="seo-title">Meta title</Label>
        <Input
          id="seo-title"
          value={value.metaTitle}
          onChange={(e) => onChange({ ...value, metaTitle: e.target.value })}
          placeholder="Default: judul"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="seo-desc">Meta description</Label>
        <Textarea
          id="seo-desc"
          value={value.metaDescription}
          onChange={(e) => onChange({ ...value, metaDescription: e.target.value })}
          placeholder="Default: ringkasan"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.noIndex}
          onChange={(e) => onChange({ ...value, noIndex: e.target.checked })}
          className="h-4 w-4"
        />
        Sembunyikan dari mesin pencari (noindex)
      </label>
    </div>
  );
}
