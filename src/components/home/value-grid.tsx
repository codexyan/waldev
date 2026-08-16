import { Gauge, PanelsTopLeft, ScrollText, Users, type LucideIcon } from "lucide-react";

const VALUES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Users,
    title: "Satu tim, satu tanggung jawab",
    body: "Riset, desain, dan rekayasa dikerjakan tim yang sama. Anda tidak perlu menjadi penerjemah antar vendor.",
  },
  {
    icon: Gauge,
    title: "Cepat dibuka di mana pun",
    body: "Disajikan lewat jaringan global Cloudflare dan dioptimalkan sejak awal, termasuk untuk jaringan seluler.",
  },
  {
    icon: PanelsTopLeft,
    title: "Bisa Anda kelola sendiri",
    body: "Setiap proyek dilengkapi dashboard admin, sehingga konten dapat diperbarui tanpa memanggil developer.",
  },
  {
    icon: ScrollText,
    title: "Rapi dan terdokumentasi",
    body: "Kode bersih, standar penulisan konsisten, dan dokumentasi serah terima agar mudah dilanjutkan siapa pun.",
  },
];

export function ValueGrid() {
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {VALUES.map((value, index) => (
        <div
          key={value.title}
          className="group bg-background p-8 transition-colors duration-500 hover:bg-muted"
          data-reveal
          style={{ transitionDelay: `${index * 70}ms` }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-all duration-500 group-hover:border-transparent group-hover:bg-signal group-hover:text-signal-foreground">
            <value.icon className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="display-sm mt-6 text-lg">{value.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.body}</p>
        </div>
      ))}
    </div>
  );
}
