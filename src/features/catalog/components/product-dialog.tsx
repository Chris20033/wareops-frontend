"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProduct } from "@/features/catalog/api";
import {
  createProductSchema,
  extractFieldErrors,
} from "@/features/catalog/schemas";
import type { ProductDto } from "@/features/catalog/types";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (product: ProductDto) => void;
}

export function ProductDialog({
  isOpen,
  onClose,
  onSuccess,
}: ProductDialogProps) {
  const queryClient = useQueryClient();

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      onClose();
      onSuccess?.(newProduct);
    },
    onError: (error) => {
      const extracted = extractFieldErrors(error);
      setFieldErrors(extracted);
      if (Object.keys(extracted).length === 0) {
        setGeneralError(
          error instanceof Error
            ? error.message
            : "No fue posible registrar el producto.",
        );
      }
    },
  });

  const resetForm = () => {
    setSku("");
    setName("");
    setDescription("");
    setFieldErrors({});
    setGeneralError(null);
  };

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const validation = createProductSchema.safeParse({
      sku,
      name,
      description,
    });
    if (!validation.success) {
      const formatted: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string" && !formatted[path]) {
          formatted[path] = issue.message;
        }
      }
      setFieldErrors(formatted);
      return;
    }

    createMutation.mutate({
      sku: validation.data.sku,
      name: validation.data.name,
      description: validation.data.description || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4"
    >
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-none">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-200/80 pb-3">
          <h2
            id="product-dialog-title"
            className="text-base font-semibold text-neutral-950"
          >
            Registrar nuevo producto
          </h2>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Cerrar modal"
          >
            ✕
          </Button>
        </div>

        {generalError ? (
          <div
            role="alert"
            className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700"
          >
            {generalError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product-sku" className="text-xs font-medium">
              Código SKU *
            </Label>
            <Input
              id="product-sku"
              name="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="PROD-VAL-01"
              maxLength={80}
              className={`mt-1 h-8 font-mono text-xs uppercase ${
                fieldErrors.sku ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
              aria-invalid={Boolean(fieldErrors.sku)}
              aria-describedby={
                fieldErrors.sku ? "product-sku-error" : undefined
              }
            />
            {fieldErrors.sku ? (
              <p
                id="product-sku-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.sku}
              </p>
            ) : (
              <p className="mt-1 text-xs text-neutral-500">
                Identificador único de producto en la organización.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="product-name" className="text-xs font-medium">
              Nombre del producto *
            </Label>
            <Input
              id="product-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Caja de Cartón Reforzada 40x40"
              maxLength={160}
              className={`mt-1 h-8 text-xs ${
                fieldErrors.name ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={
                fieldErrors.name ? "product-name-error" : undefined
              }
            />
            {fieldErrors.name ? (
              <p
                id="product-name-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div>
            <Label
              htmlFor="product-description"
              className="text-xs font-medium"
            >
              Descripción del producto (opcional)
            </Label>
            <Input
              id="product-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Empaque industrial corrugado calibre estándar"
              maxLength={500}
              className={`mt-1 h-8 text-xs ${
                fieldErrors.description
                  ? "border-red-500 ring-1 ring-red-500"
                  : ""
              }`}
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={
                fieldErrors.description
                  ? "product-description-error"
                  : undefined
              }
            />
            {fieldErrors.description ? (
              <p
                id="product-description-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.description}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-neutral-200/80 pt-3">
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={createMutation.isPending}
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" size="xs" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Registrando..." : "Guardar producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
