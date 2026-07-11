import type { ZodError } from "zod";

/** Hasil standar untuk semua Server Action. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export const FORBIDDEN = {
  ok: false as const,
  error: "Anda tidak memiliki izin untuk aksi ini.",
};

export function invalid(error: ZodError): ActionResult<never> {
  return {
    ok: false,
    error: "Periksa kembali isian formulir.",
    fieldErrors: error.flatten().fieldErrors,
  };
}
