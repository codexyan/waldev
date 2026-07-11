"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface RepeatableField {
  key: string;
  label: string;
  type?: "text" | "textarea";
}

export type RepeatableRow = Record<string, string>;

export function RepeatableFields({
  label,
  fields,
  value,
  onChange,
  addLabel = "Tambah item",
}: {
  label: string;
  fields: RepeatableField[];
  value: RepeatableRow[];
  onChange: (rows: RepeatableRow[]) => void;
  addLabel?: string;
}) {
  function update(index: number, key: string, v: string) {
    onChange(value.map((row, i) => (i === index ? { ...row, [key]: v } : row)));
  }

  function add() {
    const empty: RepeatableRow = {};
    for (const f of fields) empty[f.key] = "";
    onChange([...value, empty]);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {value.map((row, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border p-3">
          {fields.map((f) =>
            f.type === "textarea" ? (
              <Textarea
                key={f.key}
                value={row[f.key] ?? ""}
                placeholder={f.label}
                onChange={(e) => update(i, f.key, e.target.value)}
                className="min-h-16"
              />
            ) : (
              <Input
                key={f.key}
                value={row[f.key] ?? ""}
                placeholder={f.label}
                onChange={(e) => update(i, f.key, e.target.value)}
              />
            ),
          )}
          <button
            type="button"
            onClick={() => remove(i)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Hapus
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
