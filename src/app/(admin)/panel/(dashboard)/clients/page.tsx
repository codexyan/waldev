import { ClientManager } from "@/modules/clients/components/client-manager";
import { listClientsForManage } from "@/modules/clients/client.dal";
import { listCategories } from "@/modules/taxonomy/taxonomy.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  await requirePagePermission("client.manage");
  const [clients, categories] = await Promise.all([
    listClientsForManage(),
    listCategories("client"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Klien</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Logo klien. Klien ber-NDA tidak ditampilkan di halaman publik.
        </p>
      </div>
      <ClientManager clients={clients} categories={categories} />
    </div>
  );
}
