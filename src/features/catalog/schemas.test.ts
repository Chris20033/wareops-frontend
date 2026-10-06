import { describe, expect, it } from "vitest";
import { ApiClientError } from "@/lib/api/errors";
import {
  attachSupplierSchema,
  createBranchSchema,
  createProductSchema,
  createSupplierSchema,
  createWarehouseSchema,
  extractFieldErrors,
} from "./schemas";

describe("Catalog Schemas & Validation", () => {
  describe("createBranchSchema", () => {
    it("transforms code to uppercase and trims inputs", () => {
      const parsed = createBranchSchema.parse({
        code: "  suc-mty-01  ",
        name: "  Sucursal Monterrey  ",
        address: "  Av. Constitución 1000  ",
      });

      expect(parsed.code).toBe("SUC-MTY-01");
      expect(parsed.name).toBe("Sucursal Monterrey");
      expect(parsed.address).toBe("Av. Constitución 1000");
    });

    it("rejects empty code and empty name", () => {
      const result = createBranchSchema.safeParse({
        code: "",
        name: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.code).toBeDefined();
        expect(errors.name).toBeDefined();
      }
    });
  });

  describe("createWarehouseSchema", () => {
    it("requires a valid UUID for branchId", () => {
      const invalid = createWarehouseSchema.safeParse({
        branchId: "invalid-uuid",
        code: "ALM-01",
        name: "Almacén Central",
      });
      expect(invalid.success).toBe(false);

      const valid = createWarehouseSchema.safeParse({
        branchId: "123e4567-e89b-12d3-a456-426614174000",
        code: "alm-01",
        name: "Almacén Central",
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.code).toBe("ALM-01");
      }
    });
  });

  describe("createProductSchema", () => {
    it("normalizes SKU to uppercase", () => {
      const parsed = createProductSchema.parse({
        sku: "  sku-prod-01  ",
        name: "Caja de Cartón",
      });
      expect(parsed.sku).toBe("SKU-PROD-01");
    });

    it("fails when SKU exceeds 80 chars", () => {
      const result = createProductSchema.safeParse({
        sku: "A".repeat(81),
        name: "Producto Test",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createSupplierSchema", () => {
    it("validates optional email correctly", () => {
      const validWithoutEmail = createSupplierSchema.safeParse({
        code: "PROV-01",
        name: "Proveedor Acme",
      });
      expect(validWithoutEmail.success).toBe(true);

      const invalidEmail = createSupplierSchema.safeParse({
        code: "PROV-01",
        name: "Proveedor Acme",
        email: "not-an-email",
      });
      expect(invalidEmail.success).toBe(false);

      const validEmail = createSupplierSchema.safeParse({
        code: "prov-01",
        name: "Proveedor Acme",
        email: "contacto@acme.com",
      });
      expect(validEmail.success).toBe(true);
      if (validEmail.success) {
        expect(validEmail.data.code).toBe("PROV-01");
      }
    });
  });

  describe("attachSupplierSchema", () => {
    it("requires a valid supplierId UUID", () => {
      expect(
        attachSupplierSchema.safeParse({ supplierId: "not-uuid" }).success,
      ).toBe(false);
      expect(
        attachSupplierSchema.safeParse({
          supplierId: "123e4567-e89b-12d3-a456-426614174000",
        }).success,
      ).toBe(true);
    });
  });

  describe("extractFieldErrors helper", () => {
    it("extracts nested fields from validation error", () => {
      const error = new ApiClientError({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Error de validación",
        details: {
          fields: {
            code: ["El código debe ser único."],
            name: ["El nombre es muy corto."],
          },
        },
      });

      const extracted = extractFieldErrors(error);
      expect(extracted.code).toBe("El código debe ser único.");
      expect(extracted.name).toBe("El nombre es muy corto.");
    });

    it("extracts single field conflict error", () => {
      const error = new ApiClientError({
        statusCode: 409,
        code: "DUPLICATE_RESOURCE",
        message: "Ya existe un registro con este código en la organización.",
        details: {
          field: "code",
        },
      });

      const extracted = extractFieldErrors(error);
      expect(extracted.code).toBe(
        "Ya existe un registro con este código en la organización.",
      );
    });
  });
});
