import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { roles, user } from "@/server/db/schema";

export async function listUsers() {
  const db = getDb();
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      roleId: user.roleId,
      roleName: roles.name,
      createdAt: user.createdAt,
    })
    .from(user)
    .leftJoin(roles, eq(user.roleId, roles.id))
    .orderBy(desc(user.createdAt));
}

export async function listRolesForSelect() {
  const db = getDb();
  return db.select({ id: roles.id, name: roles.name }).from(roles).orderBy(asc(roles.name));
}

export async function setUserRole(id: string, roleId: string) {
  const db = getDb();
  await db.update(user).set({ roleId }).where(eq(user.id, id));
}

export async function setUserActive(id: string, isActive: boolean) {
  const db = getDb();
  await db.update(user).set({ isActive }).where(eq(user.id, id));
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  const rows = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  return rows[0] ?? null;
}
