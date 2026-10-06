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
import { fetchBranches, updateBranch } from "@/features/catalog/api";
import { BranchDialog } from "@/features/catalog/components/branch-dialog";
import { CatalogPagination } from "@/features/catalog/components/catalog-pagination";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import type { BranchDto } from "@/features/catalog/types";

const SORT_OPTIONS = [
  { label: "Nombre", value: "name" },
  { label: "Código", value: "code" },
  { label: "Fecha creación", value: "createdAt" },
];

export function BranchesListView() {
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
    (searchParams.get("sort") as "name" | "code" | "createdAt") || "name";
  const order = (searchParams.get("order") as "asc" | "desc") || "asc";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "branches",
      activeOrganization?.organizationId,
      { page, search, isActive, sort, order },
    ],
    queryFn: () =>
      fetchBranches({
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
      branchId,
      nextActive,
    }: {
      branchId: string;
      nextActive: boolean;
    }) => updateBranch(branchId, { isActive: nextActive }),
    onSuccess: () => {
      setFeedbackError(null);
      void queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err) => {
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "Error al actualizar el estado de la sucursal.",
      );
    },
  });

  const branches = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-950">
            Sucursales
          </h1>
          <p className="text-xs text-neutral-500">
            Centros operativos y sedes logísticas registradas para la
            organización.
          </p>
        </div>

        <PermissionGate permission="catalog:write">
          <Button type="button" size="xs" onClick={() => setIsDialogOpen(true)}>
            Nueva sucursal
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
        searchPlaceholder="Buscar por código o nombre..."
        sortOptions={SORT_OPTIONS}
      />

      <div className="rounded-lg border border-neutral-200/80 bg-white">
        {isLoading ? (
          <div
            role="status"
            className="flex items-center justify-center p-12 font-mono text-xs text-neutral-500"
          >
            [Cargando catálogo de sucursales...]
          </div>
        ) : isError ? (
          <div role="alert" className="p-8 text-center text-xs text-red-600">
            Error al consultar sucursales:{" "}
            {error instanceof Error ? error.message : "Error desconocido"}
          </div>
        ) : branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-medium text-neutral-900">
              No se encontraron sucursales
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {search || isActiveParam
                ? "Prueba ajustando los filtros de búsqueda."
                : "Comienza registrando la primera sucursal de tu organización."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200/80 bg-neutral-50/60 font-mono text-xs text-neutral-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Código</th>
                  <th className="px-4 py-2.5 font-medium">Nombre</th>
                  <th className="px-4 py-2.5 font-medium">Dirección</th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Almacenes
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
                {branches.map((branch: BranchDto) => (
                  <tr key={branch.id} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3 font-mono font-medium text-neutral-900">
                      {branch.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-950">
                      <Link
                        href={`/branches/${branch.id}`}
                        className="hover:underline"
                      >
                        {branch.name}
                      </Link>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-neutral-600">
                      {branch.address || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-700 tabular-nums">
                      {branch.warehousesCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={branch.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {branch.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/branches/${branch.id}`}>
                          <Button size="xs" variant="outline">
                            Ver detalle
                          </Button>
                        </Link>
                        <PermissionGate permission="catalog:write">
                          <Button
                            size="xs"
                            variant={
                              branch.isActive ? "destructive" : "secondary"
                            }
                            disabled={toggleStatusMutation.isPending}
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                branchId: branch.id,
                                nextActive: !branch.isActive,
                              })
                            }
                          >
                            {branch.isActive ? "Desactivar" : "Activar"}
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

      <BranchDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
