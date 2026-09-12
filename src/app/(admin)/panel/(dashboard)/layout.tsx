import { AdminShell } from "@/components/admin/admin-shell";
import { listAppsNeedingUpdate } from "@/modules/apps/app.dal";
import { requireAdminAccess } from "@/server/rbac/guard";

// Area terautentikasi, selalu dinamis (per-user, tanpa cache).
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Sesi saja tidak cukup: akun harus aktif dan punya peran.
  const current = await requireAdminAccess();

  // Lencana di menu Aplikasi: aplikasi yang sedang dibangun tapi lama tanpa kabar.
  const needingUpdate = await listAppsNeedingUpdate();

  return (
    <AdminShell
      user={{ name: current.name, email: current.email, role: current.roleName }}
      counts={{ appsNeedingUpdate: needingUpdate.length }}
    >
      {children}
    </AdminShell>
  );
}
