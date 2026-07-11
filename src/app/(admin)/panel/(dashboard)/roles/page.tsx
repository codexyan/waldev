import { Badge } from "@/components/ui/badge";
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  permissionsForRole,
  type RoleName,
} from "@/server/rbac/permissions";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

const ROLE_NAMES = Object.keys(ROLE_PERMISSIONS) as RoleName[];

export default async function RolesPage() {
  await requirePagePermission("role.manage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Roles &amp; Permissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Peran bawaan sistem dan hak akses masing-masing ({PERMISSIONS.length} permission).
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {ROLE_NAMES.map((role) => {
          const perms = permissionsForRole(role);
          const isAll = ROLE_PERMISSIONS[role] === "*";
          return (
            <div key={role} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold capitalize">{role}</h2>
                <Badge variant={isAll ? "default" : "secondary"}>
                  {isAll ? "semua" : `${perms.length}`}
                </Badge>
              </div>
              <ul className="mt-4 space-y-1">
                {perms.map((p) => (
                  <li key={p} className="text-xs text-muted-foreground">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
