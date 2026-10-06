"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  PermissionGate,
  usePermissions,
} from "@/components/auth/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  fetchBranches,
  fetchWarehouses,
  updateWarehouse,
} from "@/features/catalog/api";
import { CatalogPagination } from "@/features/catalog/components/catalog-pagination";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { WarehouseDialog } from "@/features/catalog/components/warehouse-dialog";
import type { WarehouseDto } from "@/features/catalog/types";

const SORT_OPTIONS = [
  { label: "Nombre", value: "name" },
  { label: "Código", value: "code" },
  { label: "Fecha creación", value: "createdAt" },
];

export function WarehousesListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { can, activeOrganization } = usePermissions();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const search = searchParams.get("search") ?? "";
  const branchId = searchParams.get("branchId") ?? "";
  const isActiveParam = searchParams.get("isActive");
  const isActive =
    isActiveParam === "true"
      ? true
      : isActiveParam === "false"
        ? false
        : undefined;
  const sort =
    (searchParams.get("sort") as "name" | "code" | "createdAt") || "name";
  const order = (searchParams.get("order") as "asc" | "desc") || "asc";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const { data: branchesData } = useQuery({
    queryKey: ["branches", { pageSize: 100 }],
    queryFn: () => fetchBranches({ pageSize: 100 }),
    enabled: Boolean(activeOrganization?.organizationId) && can("catalog:read"),
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "warehouses",
      activeOrganization?.organizationId,
      { page, search, branchId, isActive, sort, order },
    ],
    queryFn: () =>
      fetchWarehouses({
        page,
        pageSize: 20,
        search,
        branchId: branchId || undefined,
        isActive,
        sort,
        order,
      }),
    enabled: Boolean(activeOrganization?.organizationId) && can("catalog:read"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({
      warehouseId,
      nextActive,
    }: {
      warehouseId: string;
      nextActive: boolean;
    }) => updateWarehouse(warehouseId, { isActive: nextActive }),
    onSuccess: () => {
      setFeedbackError(null);
      void queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      void queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err) => {
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "Error al actualizar el estado del almacén.",
      );
    },
  });

  const handleBranchFilterChange = (selectedBranchId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedBranchId) {
      params.set("branchId", selectedBranchId);
    } else {
      params.delete("branchId");
    }
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const warehouses = data?.data ?? [];
  const meta = data?.meta;
  const branches = branchesData?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-950">
            Almacenes
          </h1>
          <p className="text-xs text-neutral-500">
            Espacios físicos de almacenamiento adscritos a las sucursales del
            tenant.
          </p>
        </div>

        <PermissionGate permission="catalog:write">
          <Button type="button" size="xs" onClick={() => setIsDialogOpen(true)}>
            Nuevo almacén
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
        searchPlaceholder="Buscar por código o nombre de almacén..."
        sortOptions={SORT_OPTIONS}
        extraFilters={
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-500">Sucursal:</span>
            <Select
              aria-label="Filtrar por sucursal"
              value={branchId}
              onChange={(e) => handleBranchFilterChange(e.target.value)}
              className="h-8 w-36 text-xs"
            >
              <option value="">Todas</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <div className="rounded-lg border border-neutral-200/80 bg-white">
        {isLoading ? (
          <div
            role="status"
            className="flex items-center justify-center p-12 font-mono text-xs text-neutral-500"
          >
            [Cargando catálogo de almacenes...]
          </div>
        ) : isError ? (
          <div role="alert" className="p-8 text-center text-xs text-red-600">
            Error al consultar almacenes:{" "}
            {error instanceof Error ? error.message : "Error desconocido"}
          </div>
        ) : warehouses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-medium text-neutral-900">
              No se encontraron almacenes
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {search || branchId || isActiveParam
                ? "Prueba ajustando los filtros de búsqueda o seleccionando otra sucursal."
                : "Comienza registrando el primer almacén de tu organización."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200/80 bg-neutral-50/60 font-mono text-xs text-neutral-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Código</th>
                  <th className="px-4 py-2.5 font-medium">Nombre</th>
                  <th className="px-4 py-2.5 font-medium">Sucursal</th>
                  <th className="px-4 py-2.5 font-medium">Descripción</th>
                  <th className="px-4 py-2.5 text-center font-medium">
                    Estado
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {warehouses.map((wh: WarehouseDto) => (
                  <tr key={wh.id} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3 font-mono font-medium text-neutral-900">
                      {wh.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-950">
                      <Link
                        href={`/warehouses/${wh.id}`}
                        className="hover:underline"
                      >
                        {wh.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      <Link
                        href={`/branches/${wh.branchId}`}
                        className="font-medium hover:underline"
                      >
                        {wh.branch.name}
                      </Link>{" "}
                      <span className="font-mono text-xs text-neutral-400">
                        ({wh.branch.code})
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-neutral-600">
                      {wh.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={wh.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {wh.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/warehouses/${wh.id}`}>
                          <Button size="xs" variant="outline">
                            Ver detalle
                          </Button>
                        </Link>
                        <PermissionGate permission="catalog:write">
                          <Button
                            size="xs"
                            variant={wh.isActive ? "destructive" : "secondary"}
                            disabled={toggleStatusMutation.isPending}
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                warehouseId: wh.id,
                                nextActive: !wh.isActive,
                              })
                            }
                          >
                            {wh.isActive ? "Desactivar" : "Activar"}
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

      <WarehouseDialog
        isOpen={isDialogOpen}
        defaultBranchId={branchId || undefined}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
