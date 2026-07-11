import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .min(3)
  .max(200)
  .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Email tidak valid");

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(120),
  email: emailField,
  password: z.string().min(8, "Password minimal 8 karakter").max(200),
  roleId: z.string().trim().min(1, "Pilih peran"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
