import { z } from "zod";

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidIanaTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function slugifyOrganizationName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo electrónico.")
    .max(320, "El correo no puede superar 320 caracteres.")
    .email("Ingresa un correo electrónico válido."),
  password: z
    .string()
    .min(1, "Ingresa tu contraseña.")
    .max(128, "La contraseña no puede superar 128 caracteres."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre no puede superar 120 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo electrónico.")
    .max(320, "El correo no puede superar 320 caracteres.")
    .email("Ingresa un correo electrónico válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no puede superar 128 caracteres."),
  organizationName: z
    .string()
    .trim()
    .min(2, "El nombre de la organización debe tener al menos 2 caracteres.")
    .max(120, "El nombre de la organización no puede superar 120 caracteres."),
  organizationSlug: z
    .string()
    .trim()
    .max(80, "El identificador (slug) no puede superar 80 caracteres.")
    .refine(
      (val) => val.length === 0 || (val.length >= 2 && SLUG_REGEX.test(val)),
      "Usa al menos 2 caracteres en minúsculas, números y guiones intermedios (ej. organizacion-norte).",
    ),
  timezone: z
    .string()
    .trim()
    .min(1, "Selecciona o ingresa una zona horaria.")
    .max(64, "La zona horaria no puede superar 64 caracteres.")
    .refine(
      (val) => isValidIanaTimezone(val),
      "Ingresa una zona horaria IANA válida (ej. America/Mexico_City).",
    ),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const acceptInvitationNewAccountSchema = z.object({
  token: z
    .string()
    .trim()
    .min(16, "El token de invitación debe tener al menos 16 caracteres.")
    .max(256, "El token de invitación no puede superar 256 caracteres."),
  displayName: z
    .string()
    .trim()
    .min(2, "Tu nombre debe tener al menos 2 caracteres.")
    .max(120, "Tu nombre no puede superar 120 caracteres."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no puede superar 128 caracteres."),
});

export type AcceptInvitationNewAccountValues = z.infer<
  typeof acceptInvitationNewAccountSchema
>;

export const acceptInvitationExistingAccountSchema = z.object({
  token: z
    .string()
    .trim()
    .min(16, "El token de invitación debe tener al menos 16 caracteres.")
    .max(256, "El token de invitación no puede superar 256 caracteres."),
});

export type AcceptInvitationExistingAccountValues = z.infer<
  typeof acceptInvitationExistingAccountSchema
>;
