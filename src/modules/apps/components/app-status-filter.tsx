"use client";

import { useState, type ReactNode } from "react";
import { statusLabel } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { AppStatus } from "@/modules/apps/app.schema";

type Filter = "all" | AppStatus;

const STATUS_ORDER: AppStatus[] = ["building", "released", "retired"];

/**
 * Tombol saring status di halaman Semua aplikasi (docs/09 §5.1). Kartu dirender di server;
 * komponen ini hanya mengganti `data-filter`, dan globals.css (`.app-directory`)
 * menyembunyikan kartu yang statusnya tidak cocok. Tombol tanpa kartu tidak tampil.
 */
export function AppStatusFilter({
  total,
  counts,
  children,
}: {
  total: number;
  counts: Record<AppStatus, number>;
  children: ReactNode;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const options: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: total },
    ...STATUS_ORDER.filter((status) => counts[status] > 0).map((status) => ({
      key: status,
      label: statusLabel(status),
      count: counts[status],
    })),
  ];

  return (
    <div className="app-directory" data-filter={filter}>
      <div role="group" aria-label="Saring aplikasi berdasarkan status" className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            aria-pressed={filter === option.key}
            onClick={() => setFilter(option.key)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[0.8125rem] font-medium transition-colors",
              filter === option.key
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-heading",
            )}
          >
            {option.label}
            <span className="font-mono text-xs tabular-nums opacity-70">{option.count}</span>
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
