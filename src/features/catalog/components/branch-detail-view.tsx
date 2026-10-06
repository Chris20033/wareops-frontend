"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
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
import {
  fetchBranchById,
  fetchWarehouses,
  updateBranch,
} from "@/features/catalog/api";
import {
  extractFieldErrors,
  updateBranchSchema,
} from "@/features/catalog/schemas";
import { WarehouseDialog } from "@/features/catalog/components/warehouse-dialog";
import type { WarehouseDto } from "@/features/catalog/types";

interface BranchDetailViewProps {
  branchId: string;
}

export function BranchDetailView({ branchId }: BranchDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const {
    data: branch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["branch", branchId],
    queryFn: () => fetchBranchById(branchId),
    enabled: Boolean(branchId) && can("catalog:read"),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses", { branchId }],
    queryFn: () => fetchWarehouses({ branchId, pageSize: 100 }),
    enabled: Boolean(branchId) && can("catalog:read"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { name: string; address?: string }) =>
      updateBranch(branchId, payload),
    onSuccess: () => {
      setFeedbackSuccess("Sucursal actualizada exitosamente.");
      setFeedbackError(null);
      setFieldErrors({});
      setIsEditing(false);
      void queryClient.invalidateQueries({ queryKey: ["branch", branchId] });
      void queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err) => {
      const extracted = extractFieldErrors(err);
      setFieldErrors(extracted);
      if (Object.keys(extracted).length === 0) {
        setFeedbackError(
          err instanceof Error
            ? err.message
            : "Error al actualizar la sucursal.",
        );
      }
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (nextActive: boolean) =>
      updateBranch(branchId, { isActive: nextActive }),
    onSuccess: (updated) => {
      setFeedbackSuccess(
        updated.isActive
          ? "Sucursal activada exitosamente."
          : "Sucursal desactivada exitosamente.",
      );
      setFeedbackError(null);
      void queryClient.invalidateQueries({ queryKey: ["branch", branchId] });
      void queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err) => {
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado de la sucursal.",
      );
    },
  });

  const handleStartEdit = () => {
    if (branch) {
      setName(branch.name);
      setAddress(branch.address || "");
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

    const validation = updateBranchSchema.safeParse({ name, address });
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
      address: validation.data.address || undefined,
    });
  };

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex items-center justify-center p-12 font-mono text-xs text-neutral-500"
      >
        [Cargando detalle de la sucursal...]
      </div>
    );
  }

  if (isError || !branch) {
    return (
      <div className="space-y-4">
        <Button
          size="xs"
          variant="outline"
          onClick={() => router.push("/branches")}
        >
          ← Volver a sucursales
        </Button>
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-4 text-xs text-red-700"
        >
          {error instanceof Error ? error.message : "Sucursal no encontrada."}
        </div>
      </div>
    );
  }

  const warehouses = warehousesData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="xs"
            variant="outline"
            onClick={() => router.push("/branches")}
          >
            ← Volver
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-950">
                {branch.name}
              </h1>
              <Badge
                variant={branch.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {branch.isActive ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <p className="font-mono text-xs text-neutral-500">
              Código:{" "}
              <span className="font-semibold text-neutral-900">
                {branch.code}
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
              variant={branch.isActive ? "destructive" : "secondary"}
              disabled={toggleStatusMutation.isPending}
              onClick={() => toggleStatusMutation.mutate(!branch.isActive)}
            >
              {branch.isActive ? "Desactivar sucursal" : "Activar sucursal"}
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
              Ficha de la sucursal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <Label htmlFor="edit-name" className="text-xs">
                    Nombre *
                  </Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`mt-1 h-8 text-xs ${
                      fieldErrors.name
                        ? "border-red-500 ring-1 ring-red-500"
                        : ""
                    }`}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={
                      fieldErrors.name ? "edit-name-error" : undefined
                    }
                  />
                  {fieldErrors.name ? (
                    <p
                      id="edit-name-error"
                      role="alert"
                      className="mt-1 text-xs text-red-600"
                    >
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="edit-address" className="text-xs">
                    Dirección física
                  </Label>
                  <Input
                    id="edit-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`mt-1 h-8 text-xs ${
                      fieldErrors.address
                        ? "border-red-500 ring-1 ring-red-500"
                        : ""
                    }`}
                    aria-invalid={Boolean(fieldErrors.address)}
                    aria-describedby={
                      fieldErrors.address ? "edit-address-error" : undefined
                    }
                  />
                  {fieldErrors.address ? (
                    <p
                      id="edit-address-error"
                      role="alert"
                      className="mt-1 text-xs text-red-600"
                    >
                      {fieldErrors.address}
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
                  <span className="text-neutral-500">Dirección:</span>
                  <p className="mt-0.5 text-neutral-900">
                    {branch.address || "Sin dirección registrada"}
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-2">
                  <span className="text-neutral-500">
                    Almacenes operativos:
                  </span>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-neutral-900 tabular-nums">
                    {branch.warehousesCount}
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-2 font-mono text-xs text-neutral-500">
                  <p>
                    Creada: {new Date(branch.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Actualizada:{" "}
                    {new Date(branch.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">
              Almacenes en esta sucursal ({warehouses.length})
            </CardTitle>
            <PermissionGate permission="catalog:write">
              <Button
                size="xs"
                variant="outline"
                onClick={() => setIsAddWarehouseOpen(true)}
              >
                + Añadir almacén
              </Button>
            </PermissionGate>
          </CardHeader>
          <CardContent className="p-0">
            {warehouses.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                Esta sucursal aún no tiene almacenes registrados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-200/80 bg-neutral-50/60 font-mono text-xs text-neutral-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Código</th>
                      <th className="px-4 py-2 font-medium">Nombre</th>
                      <th className="px-4 py-2 font-medium">Descripción</th>
                      <th className="px-4 py-2 text-center font-medium">
                        Estado
                      </th>
                      <th className="px-4 py-2 text-right font-medium">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/60">
                    {warehouses.map((wh: WarehouseDto) => (
                      <tr key={wh.id} className="hover:bg-neutral-50/50">
                        <td className="px-4 py-2.5 font-mono font-medium text-neutral-900">
                          {wh.code}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-neutral-950">
                          <Link
                            href={`/warehouses/${wh.id}`}
                            className="hover:underline"
                          >
                            {wh.name}
                          </Link>
                        </td>
                        <td className="max-w-xs truncate px-4 py-2.5 text-neutral-600">
                          {wh.description || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Badge
                            variant={wh.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {wh.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Link href={`/warehouses/${wh.id}`}>
                            <Button size="xs" variant="outline">
                              Ver almacén
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WarehouseDialog
        isOpen={isAddWarehouseOpen}
        defaultBranchId={branch.id}
        onClose={() => setIsAddWarehouseOpen(false)}
        onSuccess={() => {
          void queryClient.invalidateQueries({
            queryKey: ["warehouses", { branchId }],
          });
          void queryClient.invalidateQueries({
            queryKey: ["branch", branchId],
          });
        }}
      />
    </div>
  );
}
