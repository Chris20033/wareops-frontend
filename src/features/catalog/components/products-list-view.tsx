"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  PermissionGate,
  usePermissions,
} from "@/components/auth/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchProducts, updateProduct } from "@/features/catalog/api";
import { CatalogPagination } from "@/features/catalog/components/catalog-pagination";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { ProductDialog } from "@/features/catalog/components/product-dialog";
import type { ProductDto } from "@/features/catalog/types";

const SORT_OPTIONS = [
  { label: "Nombre", value: "name" },
  { label: "SKU", value: "sku" },
  { label: "Fecha creación", value: "createdAt" },
];

export function ProductsListView() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { can, activeOrganization } = usePermissions();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const search = searchParams.get("search") ?? "";
  const isActiveParam = searchParams.get("isActive");
  const isActive =
    isActiveParam === "true"
      ? true
      : isActiveParam === "false"
        ? false
        : undefined;
  const sort =
    (searchParams.get("sort") as "name" | "sku" | "createdAt") || "name";
  const order = (searchParams.get("order") as "asc" | "desc") || "asc";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "products",
      activeOrganization?.organizationId,
      { page, search, isActive, sort, order },
    ],
    queryFn: () =>
      fetchProducts({
        page,
        pageSize: 20,
        search,
        isActive,
        sort,
        order,
      }),
    enabled: Boolean(activeOrganization?.organizationId) && can("catalog:read"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({
      productId,
      nextActive,
    }: {
      productId: string;
      nextActive: boolean;
    }) => updateProduct(productId, { isActive: nextActive }),
    onSuccess: () => {
      setFeedbackError(null);
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => {
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "Error al actualizar el estado del producto.",
      );
    },
  });

  const products = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-950">
            Productos
          </h1>
          <p className="text-xs text-neutral-500">
            Catálogo de artículos, insumos y bienes administrados en inventario.
          </p>
        </div>

        <PermissionGate permission="catalog:write">
          <Button type="button" size="xs" onClick={() => setIsDialogOpen(true)}>
            Nuevo producto
          </Button>
        </PermissionGate>
      </div>

      {feedbackError ? (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          {feedbackError}
        </div>
      ) : null}

      <CatalogToolbar
        searchPlaceholder="Buscar por SKU o nombre de producto..."
        sortOptions={SORT_OPTIONS}
      />

      <div className="rounded-lg border border-neutral-200/80 bg-white">
        {isLoading ? (
          <div
            role="status"
            className="flex items-center justify-center p-12 font-mono text-xs text-neutral-500"
          >
            [Cargando catálogo de productos...]
          </div>
        ) : isError ? (
          <div role="alert" className="p-8 text-center text-xs text-red-600">
            Error al consultar productos:{" "}
            {error instanceof Error ? error.message : "Error desconocido"}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-medium text-neutral-900">
              No se encontraron productos
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {search || isActiveParam
                ? "Prueba ajustando los filtros de búsqueda."
                : "Comienza registrando el primer producto de tu organización."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200/80 bg-neutral-50/60 font-mono text-xs text-neutral-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">SKU</th>
                  <th className="px-4 py-2.5 font-medium">Nombre</th>
                  <th className="px-4 py-2.5 font-medium">Descripción</th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Proveedores
                  </th>
                  <th className="px-4 py-2.5 text-center font-medium">
                    Estado
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {products.map((product: ProductDto) => (
                  <tr key={product.id} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3 font-mono font-medium text-neutral-900">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-950">
                      <Link
                        href={`/products/${product.id}`}
                        className="hover:underline"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-neutral-600">
                      {product.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-700 tabular-nums">
                      {product.suppliersCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={product.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {product.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/products/${product.id}`}>
                          <Button size="xs" variant="outline">
                            Ver detalle
                          </Button>
                        </Link>
                        <PermissionGate permission="catalog:write">
                          <Button
                            size="xs"
                            variant={
                              product.isActive ? "destructive" : "secondary"
                            }
                            disabled={toggleStatusMutation.isPending}
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                productId: product.id,
                                nextActive: !product.isActive,
                              })
                            }
                          >
                            {product.isActive ? "Desactivar" : "Activar"}
                          </Button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta ? (
          <CatalogPagination
            page={meta.page}
            pageSize={meta.pageSize}
            totalItems={meta.totalItems}
            totalPages={meta.totalPages}
          />
        ) : null}
      </div>

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
