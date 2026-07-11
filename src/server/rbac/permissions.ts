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
  "portfolio.create",
  "portfolio.update",
  "portfolio.delete",
  "service.create",
  "service.update",
  "service.delete",
  "taxonomy.manage", // categories & tags
  "media.create",
  "media.delete",
  "testimonial.manage",
  "client.manage",
  // Leads
  "lead.read",
  "lead.update",
  // Site
  "settings.manage",
  "navigation.manage",
  "seo.manage",
  // Administration
  "user.manage",
  "role.manage",
  "activity.read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type RoleName = "owner" | "editor" | "sales";

/** "*" = seluruh permission (superuser). */
export const ROLE_PERMISSIONS: Record<RoleName, Permission[] | "*"> = {
  owner: "*",
  editor: [
    "article.create",
    "article.update",
    "article.delete",
    "article.publish",
    "portfolio.create",
    "portfolio.update",
    "portfolio.delete",
    "service.create",
    "service.update",
    "service.delete",
    "taxonomy.manage",
    "media.create",
    "media.delete",
    "testimonial.manage",
    "client.manage",
    "seo.manage",
  ],
  sales: ["lead.read", "lead.update"],
};

export function permissionsForRole(role: RoleName): Permission[] {
  const value = ROLE_PERMISSIONS[role];
  return value === "*" ? [...PERMISSIONS] : value;
}

export function roleHasPermission(role: RoleName, permission: Permission): boolean {
  const value = ROLE_PERMISSIONS[role];
  return value === "*" || value.includes(permission);
}
