import { UserManager } from "@/modules/users/components/user-manager";
import { listRolesForSelect, listUsers } from "@/modules/users/user.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const actor = await requirePagePermission("user.manage");
  const [users, roles] = await Promise.all([listUsers(), listRolesForSelect()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kelola akun admin & perannya.</p>
      </div>
      <UserManager users={users} roles={roles} currentUserId={actor.id} />
    </div>
  );
}
