const STATS = [
  { label: "Articles", value: "—" },
  { label: "Portfolio", value: "—" },
  { label: "Lead Baru", value: "—" },
  { label: "Pesan Masuk", value: "—" },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan aktivitas studio. Data akan terisi saat modul terkait diimplementasikan.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
