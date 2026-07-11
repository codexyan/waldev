import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ADMIN_BASE } from "@/lib/constants";
import { requireSession } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { roles, user } from "@/server/db/schema";
import { roleHasPermission, type Permission, type RoleName } from "./permissions";

/** Error otorisasi (izin kurang / user nonaktif). Ditangani di action → hasil forbidden. */
export class AuthzError extends Error {
  constructor(message = "FORBIDDEN") {
    super(message);
    this.name = "AuthzError";
  }
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  roleName: RoleName | null;
}

/** Ambil user aktif saat ini beserta nama peran. Redirect ke login bila tanpa sesi. */
export async function getCurrentUser(): Promise<CurrentUser> {
  const session = await requireSession();
  const db = getDb();
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      roleName: roles.name,
    })
    .from(user)
    .leftJoin(roles, eq(user.roleId, roles.id))
    .where(eq(user.id, session.user.id))
    .limit(1);

  const row = rows[0];
  if (!row || !row.isActive) {
    throw new AuthzError();
  }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    roleName: (row.roleName as RoleName | null) ?? null,
  };
}

/** Pastikan user punya permission; jika tidak, lempar AuthzError (dipakai di server action). */
export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const current = await getCurrentUser();
  if (!current.roleName || !roleHasPermission(current.roleName, permission)) {
    throw new AuthzError();
  }
  return current;
}

/** Versi untuk halaman/RSC: redirect ke dashboard bila izin kurang (bukan throw). */
export async function requirePagePermission(permission: Permission): Promise<CurrentUser> {
  const current = await getCurrentUser();
  if (!current.roleName || !roleHasPermission(current.roleName, permission)) {
    redirect(ADMIN_BASE);
  }
  return current;
}
