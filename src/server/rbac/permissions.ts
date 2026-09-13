/**
 * Registry hak akses (RBAC). Sumber kebenaran daftar permission & pemetaan peran default.
 * Dipakai untuk: seed tabel roles/permissions, guard server action/route handler,
 * dan penyembunyian menu di UI admin.
 */

export const PERMISSIONS = [
  // Content
  "article.create",
  "article.update",
  "article.delete",
  "article.publish",
  "app.create",
  "app.update", // termasuk menulis catatan aplikasi
  "app.delete",
  "client.manage", // logo klien di beranda
  "taxonomy.manage", // categories & tags
  "media.create",
  "media.delete",
  // Site
  "settings.manage",
  "navigation.manage",
  "seo.manage",
  // Inbox
  "message.manage", // pesan dari formulir di halaman Kontak
  // Administration
  "user.manage",
  "role.manage",
  "activity.read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type RoleName = "owner" | "editor";

/** "*" = seluruh permission (superuser). */
export const ROLE_PERMISSIONS: Record<RoleName, Permission[] | "*"> = {
  owner: "*",
  editor: [
    "article.create",
    "article.update",
    "article.delete",
    "article.publish",
    "app.create",
    "app.update",
    "app.delete",
    "client.manage",
    "taxonomy.manage",
    "media.create",
    "media.delete",
    "seo.manage",
  ],
};

export function permissionsForRole(role: RoleName): Permission[] {
  const value = ROLE_PERMISSIONS[role];
  return value === "*" ? [...PERMISSIONS] : value;
}

export function roleHasPermission(role: RoleName, permission: Permission): boolean {
  const value = ROLE_PERMISSIONS[role];
  return value === "*" || value.includes(permission);
}
