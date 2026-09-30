import { z } from "zod";

import { isValidIanaTimezone, SLUG_REGEX } from "@/features/auth/schemas";

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre no puede superar 120 caracteres."),
  slug: z
    .string()
    .trim()
    .min(2, "El identificador (slug) debe tener al menos 2 caracteres.")
    .max(80, "El identificador (slug) no puede superar 80 caracteres.")
    .regex(
      SLUG_REGEX,
      "Usa sólo letras minúsculas, números y guiones intermedios.",
    ),
  timezone: z
    .string()
    .trim()
    .min(1, "Selecciona o ingresa una zona horaria.")
    .max(64, "La zona horaria no puede superar 64 caracteres.")
    .refine(
      (val) => isValidIanaTimezone(val),
      "Ingresa una zona horaria IANA válida.",
    ),
});

export type UpdateOrganizationFormValues = z.infer<
  typeof updateOrganizationSchema
>;
