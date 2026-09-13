import { AdminShell } from "@/components/admin/admin-shell";
import { listAppsNeedingUpdate } from "@/modules/apps/app.dal";
import { countNewMessages } from "@/modules/messages/message.dal";
import { requireAdminAccess } from "@/server/rbac/guard";
import { roleHasPermission } from "@/server/rbac/permissions";

// Area terautentikasi, selalu dinamis (per-user, tanpa cache).
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Sesi saja tidak cukup: akun harus aktif dan punya peran.
  const current = await requireAdminAccess();

  // Lencana di menu Aplikasi: aplikasi yang sedang dibangun tapi lama tanpa kabar.
  // Lencana di menu Pesan: pesan kontak belum dibaca, hanya untuk peran yang boleh membukanya.
  const canReadMessages = Boolean(
    current.roleName && roleHasPermission(current.roleName, "message.manage"),
  );
  const [needingUpdate, newMessages] = await Promise.all([
    listAppsNeedingUpdate(),
    canReadMessages ? countNewMessages() : Promise.resolve(0),
  ]);

  return (
    <AdminShell
      user={{ name: current.name, email: current.email, role: current.roleName }}
      counts={{ appsNeedingUpdate: needingUpdate.length, newMessages }}
    >
      {children}
    </AdminShell>
  );
}
