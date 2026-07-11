"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/lib/action";

export function LeadStatusSelect({
  id,
  status,
  options,
  onChange,
}: {
  id: string;
  status: string;
  options: readonly string[];
  onChange: (id: string, status: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  async function handle(next: string) {
    const prev = value;
    setValue(next);
    setBusy(true);
    const res = await onChange(id, next);
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      setValue(prev);
      window.alert(res.error);
    }
  }

  return (
    <Select
      value={value}
      disabled={busy}
      onChange={(e) => handle(e.target.value)}
      className="h-8 w-auto text-xs"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </Select>
  );
}
