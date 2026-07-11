import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { getAuth } from "@/server/auth/config";
import { getDb } from "@/server/db/client";
import {
  permissions as permissionsTable,
  rolePermissions,
  roles,
  user,
} from "@/server/db/schema";
import { PERMISSIONS, permissionsForRole, type RoleName } from "@/server/rbac/permissions";

/**
 * Seed idempotent: permissions + roles + role_permissions + owner pertama.
 * Dilindungi header `x-seed-secret` (dibandingkan dengan CRON_SECRET).
 * Owner dibuat via Better Auth agar password ter-hash dengan benar.
 *
 * Contoh:
 *   curl -X POST http://localhost:3000/api/seed \
 *     -H "x-seed-secret: <CRON_SECRET>" -H "content-type: application/json" \
 *     -d '{"email":"owner@waldev.dev","password":"<min 8 char>","name":"Owner"}'
 */
export async function POST(request: Request): Promise<Response> {
  const { env } = getCloudflareContext();
  const secret = (env as unknown as { CRON_SECRET?: string }).CRON_SECRET;

  if (!secret || request.headers.get("x-seed-secret") !== secret) {
    return Response.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    name?: string;
  } | null;

  if (!body?.email || !body?.password) {
    return Response.json(
      { success: false, error: "email & password wajib" },
      { status: 400 },
    );
  }

  const db = getDb();
  const roleNames: RoleName[] = ["owner", "editor", "sales"];

  // 1) permissions
  await db
    .insert(permissionsTable)
    .values(PERMISSIONS.map((key) => ({ key })))
    .onConflictDoNothing();

  // 2) roles
  await db
    .insert(roles)
    .values(roleNames.map((name) => ({ name, isSystem: true })))
    .onConflictDoNothing();

  // 3) role_permissions
  const allPerms = await db.select().from(permissionsTable);
  const permIdByKey = new Map(allPerms.map((p) => [p.key, p.id]));
  const allRoles = await db.select().from(roles);
  const roleIdByName = new Map(allRoles.map((r) => [r.name, r.id]));

  const rpValues: { roleId: string; permissionId: string }[] = [];
  for (const roleName of roleNames) {
    const roleId = roleIdByName.get(roleName);
    if (!roleId) continue;
    for (const permKey of permissionsForRole(roleName)) {
      const permissionId = permIdByKey.get(permKey);
      if (permissionId) rpValues.push({ roleId, permissionId });
    }
  }
  if (rpValues.length > 0) {
    await db.insert(rolePermissions).values(rpValues).onConflictDoNothing();
  }

  // 4) owner pertama
  const ownerRoleId = roleIdByName.get("owner");
  const existing = await db.select().from(user).where(eq(user.email, body.email)).limit(1);
  let ownerCreated = false;

  if (existing.length === 0) {
    try {
      await getAuth().api.signUpEmail({
        body: { email: body.email, password: body.password, name: body.name ?? "Owner" },
      });
      ownerCreated = true;
    } catch (err) {
      return Response.json(
        { success: false, error: err instanceof Error ? err.message : "Gagal membuat owner" },
        { status: 400 },
      );
    }
  }

  if (ownerRoleId) {
    await db
      .update(user)
      .set({ roleId: ownerRoleId, isActive: true })
      .where(eq(user.email, body.email));
  }

  return Response.json({
    success: true,
    data: {
      permissions: PERMISSIONS.length,
      roles: roleNames.length,
      rolePermissions: rpValues.length,
      ownerCreated,
      ownerEmail: body.email,
    },
  });
}
