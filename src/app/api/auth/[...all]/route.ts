import { getAuth } from "@/server/auth/config";

// Endpoint Better Auth (login/logout/session). Instance dibuat per-request
// karena bindings D1 & secrets bersifat edge-scoped di Cloudflare Workers.
export async function GET(request: Request): Promise<Response> {
  return getAuth().handler(request);
}

export async function POST(request: Request): Promise<Response> {
  return getAuth().handler(request);
}
