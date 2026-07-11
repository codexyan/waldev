import { NextResponse, type NextRequest } from "next/server";

const ADMIN_BASE = "/panel";

/**
 * Proxy (dulu "middleware") pelindung area admin.
 *
 * Tahap ini: penjaga ringan berbasis keberadaan cookie sesi (edge-friendly).
 * Validasi sesi penuh (Better Auth) + otorisasi RBAC dilakukan di server
 * (layout/actions) pada fase Auth. `matcher` memakai literal statik; jika
 * ADMIN_BASE diganti, selaraskan juga matcher di bawah.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === `${ADMIN_BASE}/login`;

  if (isLoginRoute) return NextResponse.next();

  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("session_token"));

  if (!hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = `${ADMIN_BASE}/login`;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
