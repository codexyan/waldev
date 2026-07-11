"use client";

import { createAuthClient } from "better-auth/react";

/** Client Better Auth (same-origin → /api/auth). Dipakai di komponen client saja. */
export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;
