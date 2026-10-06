import { z } from "zod";
import { ApiClientError } from "@/lib/api/errors";

export const createBranchSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "El código es requerido.")
    .max(40, "Máximo 40 caracteres.")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(1, "El nombre de la sucursal es requerido.")
    .max(120, "Máximo 120 caracteres."),
  address: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type CreateBranchFormValues = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido.")
    .max(120, "Máximo 120 caracteres."),
  address: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type UpdateBranchFormValues = z.infer<typeof updateBranchSchema>;

export const createWarehouseSchema = z.object({
  branchId: z
    .string()
    .uuid("Selecciona una sucursal válida.")
    .min(1, "La sucursal es requerida."),
  code: z
    .string()
    .trim()
    .min(1, "El código del almacén es requerido.")
    .max(40, "Máximo 40 caracteres.")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(1, "El nombre del almacén es requerido.")
    .max(120, "Máximo 120 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type CreateWarehouseFormValues = z.infer<typeof createWarehouseSchema>;

export const updateWarehouseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido.")
    .max(120, "Máximo 120 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type UpdateWarehouseFormValues = z.infer<typeof updateWarehouseSchema>;

export const createProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, "El código SKU es requerido.")
    .max(80, "Máximo 80 caracteres.")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(1, "El nombre del producto es requerido.")
    .max(160, "Máximo 160 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido.")
    .max(160, "Máximo 160 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

export const createSupplierSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "El código de proveedor es requerido.")
    .max(40, "Máximo 40 caracteres.")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(1, "El nombre del proveedor es requerido.")
    .max(160, "Máximo 160 caracteres."),
  contactName: z
    .string()
    .trim()
    .max(120, "Máximo 120 caracteres.")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(320, "Máximo 320 caracteres.")
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Ingresa un correo electrónico válido.",
    }),
  phone: z
    .string()
    .trim()
    .max(40, "Máximo 40 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type CreateSupplierFormValues = z.infer<typeof createSupplierSchema>;

export const updateSupplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido.")
    .max(160, "Máximo 160 caracteres."),
  contactName: z
    .string()
    .trim()
    .max(120, "Máximo 120 caracteres.")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(320, "Máximo 320 caracteres.")
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Ingresa un correo electrónico válido.",
    }),
  phone: z
    .string()
    .trim()
    .max(40, "Máximo 40 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type UpdateSupplierFormValues = z.infer<typeof updateSupplierSchema>;

export const attachSupplierSchema = z.object({
  supplierId: z
    .string()
    .uuid("Selecciona un proveedor válido.")
    .min(1, "El proveedor es requerido."),
});

export type AttachSupplierFormValues = z.infer<typeof attachSupplierSchema>;

/**
 * Extracts field-level validation errors from an API error response.
 */
export function extractFieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};

  if (!(error instanceof ApiClientError)) {
    return result;
  }

  const details = error.details;
  if (!details) {
    return result;
  }

  // Handle nested fields: { fields: { [fieldName]: string[] } }
  if (details.fields && typeof details.fields === "object") {
    for (const [key, msgs] of Object.entries(details.fields)) {
      if (
        Array.isArray(msgs) &&
        msgs.length > 0 &&
        typeof msgs[0] === "string"
      ) {
        result[key] = msgs[0];
      }
    }
  }

  // Handle single field conflict: { field: "code" }
  if (typeof details.field === "string" && !result[details.field]) {
    result[details.field] = error.message;
  }

  return result;
}
