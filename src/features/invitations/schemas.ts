import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa el correo electrónico de la persona a invitar.")
    .max(320, "El correo no puede superar 320 caracteres.")
    .email("Ingresa un correo electrónico válido."),
  roleCode: z.enum(["ADMIN", "MANAGER", "OPERATOR", "VIEWER"], {
    message: "Selecciona un rol válido para la invitación.",
  }),
});

export type CreateInvitationFormValues = z.infer<typeof createInvitationSchema>;
