import { getAuth } from "@/server/auth/config";

/**
 * Endpoint Better Auth (login/logout/session). Instance dibuat per-request
 * karena bindings D1 & secrets bersifat edge-scoped di Cloudflare Workers.
 *
 * Pendaftaran mandiri lewat HTTP sengaja ditutup. Better Auth membuka
 * /api/auth/sign-up/email begitu emailAndPassword diaktifkan, sehingga siapa
 * pun bisa membuat akun dan menembus penjaga sesi panel. Akun admin hanya
 * boleh dibuat dari dalam panel (createUserAction) atau lewat /api/seed, yang
 * keduanya memanggil `auth.api.signUpEmail` di server tanpa melewati rute ini.
 */
function isSignUp(request: Request): boolean {
  return new URL(request.url).pathname.includes("/sign-up");
}

const SIGN_UP_BLOCKED = Response.json(
  { error: { message: "Pendaftaran mandiri tidak tersedia." } },
  { status: 404 },
);

export async function GET(request: Request): Promise<Response> {
  if (isSignUp(request)) return SIGN_UP_BLOCKED.clone();
  return getAuth().handler(request);
}

export async function POST(request: Request): Promise<Response> {
  if (isSignUp(request)) return SIGN_UP_BLOCKED.clone();
  return getAuth().handler(request);
}
