import { AdminShell } from "@/components/admin/admin-shell";
import { countNewCollaborations, countNewContacts } from "@/modules/leads/lead.dal";
import { requireAdminAccess } from "@/server/rbac/guard";

// Area terautentikasi, selalu dinamis (per-user, tanpa cache).
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Sesi saja tidak cukup: akun harus aktif dan punya peran.
  const current = await requireAdminAccess();

  const [collaboration, contacts] = await Promise.all([
    countNewCollaborations(),
    countNewContacts(),
  ]);

  return (
    <AdminShell
      user={{ name: current.name, email: current.email, role: current.roleName }}
      counts={{ collaboration, contacts }}
    >
      {children}
    </AdminShell>
  );
}
