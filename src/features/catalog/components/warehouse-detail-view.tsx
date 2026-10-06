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
import { fetchWarehouseById, updateWarehouse } from "@/features/catalog/api";
import {
  extractFieldErrors,
  updateWarehouseSchema,
} from "@/features/catalog/schemas";

interface WarehouseDetailViewProps {
  warehouseId: string;
}

export function WarehouseDetailView({ warehouseId }: WarehouseDetailViewProps) {
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
    data: warehouse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["warehouse", warehouseId],
    queryFn: () => fetchWarehouseById(warehouseId),
    enabled: Boolean(warehouseId) && can("catalog:read"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      updateWarehouse(warehouseId, payload),
    onSuccess: () => {
      setFeedbackSuccess("Almacén actualizado exitosamente.");
      setFeedbackError(null);
      setFieldErrors({});
      setIsEditing(false);
      void queryClient.invalidateQueries({
        queryKey: ["warehouse", warehouseId],
      });
      void queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
    onError: (err) => {
      const extracted = extractFieldErrors(err);
      setFieldErrors(extracted);
      if (Object.keys(extracted).length === 0) {
        setFeedbackError(
          err instanceof Error
            ? err.message
            : "Error al actualizar el almacén.",
        );
      }
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (nextActive: boolean) =>
      updateWarehouse(warehouseId, { isActive: nextActive }),
    onSuccess: (updated) => {
      setFeedbackSuccess(
        updated.isActive
          ? "Almacén activado exitosamente."
          : "Almacén desactivado exitosamente.",
      );
      setFeedbackError(null);
      void queryClient.invalidateQueries({
        queryKey: ["warehouse", warehouseId],
      });
      void queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
    onError: (err) => {
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado del almacén.",
      );
    },
  });

  const handleStartEdit = () => {
    if (warehouse) {
      setName(warehouse.name);
      setDescription(warehouse.description || "");
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

    const validation = updateWarehouseSchema.safeParse({ name, description });
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
        [Cargando detalle del almacén...]
      </div>
    );
  }

  if (isError || !warehouse) {
    return (
      <div className="space-y-4">
        <Button
          size="xs"
          variant="outline"
          onClick={() => router.push("/warehouses")}
        >
          ← Volver a almacenes
        </Button>
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-4 text-xs text-red-700"
        >
          {error instanceof Error ? error.message : "Almacén no encontrado."}
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
            onClick={() => router.push("/warehouses")}
          >
            ← Volver
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-950">
                {warehouse.name}
              </h1>
              <Badge
                variant={warehouse.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {warehouse.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="font-mono text-xs text-neutral-500">
              Código:{" "}
              <span className="font-semibold text-neutral-900">
                {warehouse.code}
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
              variant={warehouse.isActive ? "destructive" : "secondary"}
              disabled={toggleStatusMutation.isPending}
              onClick={() => toggleStatusMutation.mutate(!warehouse.isActive)}
            >
              {warehouse.isActive ? "Desactivar almacén" : "Activar almacén"}
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Datos del almacén
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <Label htmlFor="edit-wh-name" className="text-xs">
                    Nombre del almacén *
                  </Label>
                  <Input
                    id="edit-wh-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`mt-1 h-8 text-xs ${
                      fieldErrors.name
                        ? "border-red-500 ring-1 ring-red-500"
                        : ""
                    }`}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={
                      fieldErrors.name ? "edit-wh-name-error" : undefined
                    }
                  />
                  {fieldErrors.name ? (
                    <p
                      id="edit-wh-name-error"
                      role="alert"
                      className="mt-1 text-xs text-red-600"
                    >
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="edit-wh-description" className="text-xs">
                    Descripción operativa
                  </Label>
                  <Input
                    id="edit-wh-description"
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
                        ? "edit-wh-description-error"
                        : undefined
                    }
                  />
                  {fieldErrors.description ? (
                    <p
                      id="edit-wh-description-error"
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
                    {warehouse.description || "Sin descripción operativa"}
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-3">
                  <span className="text-neutral-500">
                    Sucursal de pertenencia:
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <Link
                      href={`/branches/${warehouse.branch.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {warehouse.branch.name}
                    </Link>
                    <Badge variant="outline" className="font-mono text-xs">
                      {warehouse.branch.code}
                    </Badge>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-3 font-mono text-xs text-neutral-500">
                  <p>
                    Creado: {new Date(warehouse.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Actualizado:{" "}
                    {new Date(warehouse.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
