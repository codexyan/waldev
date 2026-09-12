import { listClientsForManage } from "@/modules/clients/client.dal";
import { ClientManager } from "@/modules/clients/components/client-manager";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  await requirePagePermission("client.manage");
  const clients = await listClientsForManage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Klien</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Logo klien tampil di beranda, tepat di bawah hero. Klien bertanda NDA tidak ditampilkan.
        </p>
      </div>
      <ClientManager clients={clients} />
    </div>
  );
}
