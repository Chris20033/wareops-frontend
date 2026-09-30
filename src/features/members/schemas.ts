import { z } from "zod";

export const updateMemberRoleSchema = z.object({
  roleCode: z.enum(["OWNER", "ADMIN", "MANAGER", "OPERATOR", "VIEWER"], {
    message: "Selecciona un rol válido.",
  }),
});

export type UpdateMemberRoleFormValues = z.infer<typeof updateMemberRoleSchema>;
