"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  PermissionGate,
  usePermissions,
} from "@/components/auth/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchProductById, updateProduct } from "@/features/catalog/api";
import {
  extractFieldErrors,
  updateProductSchema,
} from "@/features/catalog/schemas";
import { ProductSupplierManager } from "@/features/catalog/components/product-supplier-manager";

interface ProductDetailViewProps {
  productId: string;
}

export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: Boolean(productId) && can("catalog:read"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      updateProduct(productId, payload),
    onSuccess: () => {
      setFeedbackSuccess("Producto actualizado exitosamente.");
      setFeedbackError(null);
      setFieldErrors({});
      setIsEditing(false);
      void queryClient.invalidateQueries({ queryKey: ["product", productId] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => {
      const extracted = extractFieldErrors(err);
      setFieldErrors(extracted);
      if (Object.keys(extracted).length === 0) {
        setFeedbackError(
          err instanceof Error
            ? err.message
            : "Error al actualizar el producto.",
        );
      }
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (nextActive: boolean) =>
      updateProduct(productId, { isActive: nextActive }),
    onSuccess: (updated) => {
      setFeedbackSuccess(
        updated.isActive
          ? "Producto activado exitosamente."
          : "Producto desactivado exitosamente.",
      );
      setFeedbackError(null);
      void queryClient.invalidateQueries({ queryKey: ["product", productId] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => {
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado del producto.",
      );
    },
  });

  const handleStartEdit = () => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setFieldErrors({});
      setFeedbackError(null);
      setFeedbackSuccess(null);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setFeedbackError(null);
    setFeedbackSuccess(null);

    const validation = updateProductSchema.safeParse({ name, description });
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

    updateMutation.mutate({
      name: validation.data.name,
      description: validation.data.description || undefined,
    });
  };

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex items-center justify-center p-12 font-mono text-xs text-neutral-500"
      >
        [Cargando detalle del producto...]
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-4">
        <Button
          size="xs"
          variant="outline"
          onClick={() => router.push("/products")}
        >
          ← Volver a productos
        </Button>
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-4 text-xs text-red-700"
        >
          {error instanceof Error ? error.message : "Producto no encontrado."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="xs"
            variant="outline"
            onClick={() => router.push("/products")}
          >
            ← Volver
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-950">
                {product.name}
              </h1>
              <Badge
                variant={product.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {product.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="font-mono text-xs text-neutral-500">
              SKU:{" "}
              <span className="font-semibold text-neutral-900">
                {product.sku}
              </span>
            </p>
          </div>
        </div>

        <PermissionGate permission="catalog:write">
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button size="xs" variant="outline" onClick={handleStartEdit}>
                Editar datos
              </Button>
            ) : null}
            <Button
              size="xs"
              variant={product.isActive ? "destructive" : "secondary"}
              disabled={toggleStatusMutation.isPending}
              onClick={() => toggleStatusMutation.mutate(!product.isActive)}
            >
              {product.isActive ? "Desactivar producto" : "Activar producto"}
            </Button>
          </div>
        </PermissionGate>
      </div>

      {feedbackSuccess ? (
        <div
          role="status"
          className="rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"
        >
          {feedbackSuccess}
        </div>
      ) : null}

      {feedbackError ? (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          {feedbackError}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Ficha del producto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <Label htmlFor="edit-prod-name" className="text-xs">
                    Nombre del producto *
                  </Label>
                  <Input
                    id="edit-prod-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`mt-1 h-8 text-xs ${
                      fieldErrors.name
                        ? "border-red-500 ring-1 ring-red-500"
                        : ""
                    }`}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={
                      fieldErrors.name ? "edit-prod-name-error" : undefined
                    }
                  />
                  {fieldErrors.name ? (
                    <p
                      id="edit-prod-name-error"
                      role="alert"
                      className="mt-1 text-xs text-red-600"
                    >
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="edit-prod-desc" className="text-xs">
                    Descripción del producto
                  </Label>
                  <Input
                    id="edit-prod-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`mt-1 h-8 text-xs ${
                      fieldErrors.description
                        ? "border-red-500 ring-1 ring-red-500"
                        : ""
                    }`}
                    aria-invalid={Boolean(fieldErrors.description)}
                    aria-describedby={
                      fieldErrors.description
                        ? "edit-prod-desc-error"
                        : undefined
                    }
                  />
                  {fieldErrors.description ? (
                    <p
                      id="edit-prod-desc-error"
                      role="alert"
                      className="mt-1 text-xs text-red-600"
                    >
                      {fieldErrors.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="submit"
                    size="xs"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending
                      ? "Guardando..."
                      : "Guardar cambios"}
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <span className="text-neutral-500">Descripción:</span>
                  <p className="mt-0.5 text-neutral-900">
                    {product.description || "Sin descripción registrada"}
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-3">
                  <span className="text-neutral-500">
                    Proveedores vinculados:
                  </span>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-neutral-900 tabular-nums">
                    {product.suppliersCount}
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-3 font-mono text-xs text-neutral-500">
                  <p>
                    Creado: {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Actualizado:{" "}
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <ProductSupplierManager productId={product.id} />
        </div>
      </div>
    </div>
  );
}
