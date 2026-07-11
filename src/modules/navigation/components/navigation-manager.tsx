"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RepeatableFields, type RepeatableRow } from "@/components/ui/repeatable-fields";
import { saveMenuAction } from "@/modules/navigation/navigation.actions";

const FIELDS = [
  { key: "label", label: "Label" },
  { key: "url", label: "URL (mis. /portfolio)" },
];

export function NavigationManager({
  header,
  footer,
}: {
  header: RepeatableRow[];
  footer: RepeatableRow[];
}) {
  const router = useRouter();
  const [h, setH] = useState<RepeatableRow[]>(header);
  const [f, setF] = useState<RepeatableRow[]>(footer);
  const [busy, setBusy] = useState<string | null>(null);

  async function save(key: "header" | "footer", rows: RepeatableRow[]) {
    setBusy(key);
    const res = await saveMenuAction(
      key,
      rows.map((r) => ({ label: r.label ?? "", url: r.url ?? "" })),
    );
    setBusy(null);
    if (res.ok) router.refresh();
    else window.alert(res.error);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <RepeatableFields label="Header menu" addLabel="Tambah item" fields={FIELDS} value={h} onChange={setH} />
        <Button type="button" onClick={() => save("header", h)} disabled={busy === "header"}>
          {busy === "header" ? "Menyimpan…" : "Simpan Header"}
        </Button>
      </div>
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <RepeatableFields label="Footer menu" addLabel="Tambah item" fields={FIELDS} value={f} onChange={setF} />
        <Button type="button" onClick={() => save("footer", f)} disabled={busy === "footer"}>
          {busy === "footer" ? "Menyimpan…" : "Simpan Footer"}
        </Button>
      </div>
    </div>
  );
}
