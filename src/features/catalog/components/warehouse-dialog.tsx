"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createWarehouse, fetchBranches } from "@/features/catalog/api";
import {
  createWarehouseSchema,
  extractFieldErrors,
} from "@/features/catalog/schemas";
import type { WarehouseDto } from "@/features/catalog/types";

interface WarehouseDialogProps {
  isOpen: boolean;
  defaultBranchId?: string;
  onClose: () => void;
  onSuccess?: (warehouse: WarehouseDto) => void;
}

export function WarehouseDialog({
  isOpen,
  defaultBranchId,
  onClose,
  onSuccess,
}: WarehouseDialogProps) {
  const queryClient = useQueryClient();

  const [branchId, setBranchId] = useState(defaultBranchId || "");
  const [prevDefaultBranchId, setPrevDefaultBranchId] =
    useState(defaultBranchId);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (defaultBranchId !== prevDefaultBranchId) {
    setPrevDefaultBranchId(defaultBranchId);
    if (defaultBranchId) {
      setBranchId(defaultBranchId);
    }
  }

  const { data: branchesData } = useQuery({
    queryKey: ["branches", { pageSize: 100, isActive: true }],
    queryFn: () => fetchBranches({ pageSize: 100, isActive: true }),
    enabled: isOpen,
  });

  const branches = branchesData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: createWarehouse,
    onSuccess: (newWarehouse) => {
      void queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      void queryClient.invalidateQueries({ queryKey: ["branches"] });
      resetForm();
      onClose();
      onSuccess?.(newWarehouse);
    },
    onError: (error) => {
      const extracted = extractFieldErrors(error);
      setFieldErrors(extracted);
      if (Object.keys(extracted).length === 0) {
        setGeneralError(
          error instanceof Error
            ? error.message
            : "No fue posible registrar el almacén.",
        );
      }
    },
  });

  const resetForm = () => {
    if (!defaultBranchId) setBranchId("");
    setCode("");
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

    const validation = createWarehouseSchema.safeParse({
      branchId,
      code,
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
      branchId: validation.data.branchId,
      code: validation.data.code,
      name: validation.data.name,
      description: validation.data.description || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="warehouse-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4"
    >
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-none">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-200/80 pb-3">
          <h2
            id="warehouse-dialog-title"
            className="text-base font-semibold text-neutral-950"
          >
            Registrar nuevo almacén
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
            <Label htmlFor="warehouse-branch" className="text-xs font-medium">
              Sucursal de adscripción *
            </Label>
            <Select
              id="warehouse-branch"
              name="branchId"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className={`mt-1 h-8 text-xs ${
                fieldErrors.branchId ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
              aria-invalid={Boolean(fieldErrors.branchId)}
              aria-describedby={
                fieldErrors.branchId ? "warehouse-branch-error" : undefined
              }
            >
              <option value="">Selecciona una sucursal...</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </Select>
            {fieldErrors.branchId ? (
              <p
                id="warehouse-branch-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.branchId}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="warehouse-code" className="text-xs font-medium">
              Código del almacén *
            </Label>
            <Input
              id="warehouse-code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ALM-MTY-01"
              maxLength={40}
              className={`mt-1 h-8 font-mono text-xs uppercase ${
                fieldErrors.code ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
              aria-invalid={Boolean(fieldErrors.code)}
              aria-describedby={
                fieldErrors.code ? "warehouse-code-error" : undefined
              }
            />
            {fieldErrors.code ? (
              <p
                id="warehouse-code-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.code}
              </p>
            ) : (
              <p className="mt-1 text-xs text-neutral-500">
                Único dentro de la sucursal seleccionada.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="warehouse-name" className="text-xs font-medium">
              Nombre descriptivo *
            </Label>
            <Input
              id="warehouse-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Almacén General de Alta Rotación"
              maxLength={120}
              className={`mt-1 h-8 text-xs ${
                fieldErrors.name ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={
                fieldErrors.name ? "warehouse-name-error" : undefined
              }
            />
            {fieldErrors.name ? (
              <p
                id="warehouse-name-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div>
            <Label
              htmlFor="warehouse-description"
              className="text-xs font-medium"
            >
              Descripción operativa (opcional)
            </Label>
            <Input
              id="warehouse-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Zona de racks refrigerados para perecederos"
              maxLength={500}
              className={`mt-1 h-8 text-xs ${
                fieldErrors.description
                  ? "border-red-500 ring-1 ring-red-500"
                  : ""
              }`}
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={
                fieldErrors.description
                  ? "warehouse-description-error"
                  : undefined
              }
            />
            {fieldErrors.description ? (
              <p
                id="warehouse-description-error"
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
              {createMutation.isPending ? "Registrando..." : "Guardar almacén"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
