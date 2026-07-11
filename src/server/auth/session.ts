import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_BASE } from "@/lib/constants";
import { getAuth } from "./config";

/** Ambil sesi aktif (atau null) dari request saat ini. Hanya untuk server. */
export async function getSession() {
  return getAuth().api.getSession({ headers: await headers() });
}

/** Wajibkan sesi; redirect ke login bila tidak ada. Mengembalikan sesi + user. */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect(`${ADMIN_BASE}/login`);
  }
  return session;
}
