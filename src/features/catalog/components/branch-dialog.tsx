"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBranch } from "@/features/catalog/api";
import {
  createBranchSchema,
  extractFieldErrors,
} from "@/features/catalog/schemas";
import type { BranchDto } from "@/features/catalog/types";

interface BranchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (branch: BranchDto) => void;
}

export function BranchDialog({
  isOpen,
  onClose,
  onSuccess,
}: BranchDialogProps) {
  const queryClient = useQueryClient();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: (newBranch) => {
      void queryClient.invalidateQueries({ queryKey: ["branches"] });
      resetForm();
      onClose();
      onSuccess?.(newBranch);
    },
    onError: (error) => {
      const extracted = extractFieldErrors(error);
      setFieldErrors(extracted);
      if (Object.keys(extracted).length === 0) {
        setGeneralError(
          error instanceof Error
            ? error.message
            : "No fue posible registrar la sucursal.",
        );
      }
    },
  });

  const resetForm = () => {
    setCode("");
    setName("");
    setAddress("");
    setFieldErrors({});
    setGeneralError(null);
  };

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const validation = createBranchSchema.safeParse({ code, name, address });
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
      code: validation.data.code,
      name: validation.data.name,
      address: validation.data.address || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="branch-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4"
    >
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-none">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-200/80 pb-3">
          <h2
            id="branch-dialog-title"
            className="text-base font-semibold text-neutral-950"
          >
            Registrar nueva sucursal
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
            <Label htmlFor="branch-code" className="text-xs font-medium">
              Código de sucursal *
            </Label>
            <Input
              id="branch-code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SUC-NORTE-01"
              maxLength={40}
              className={`mt-1 h-8 font-mono text-xs uppercase ${
                fieldErrors.code ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
              aria-invalid={Boolean(fieldErrors.code)}
              aria-describedby={
                fieldErrors.code ? "branch-code-error" : undefined
              }
            />
            {fieldErrors.code ? (
              <p
                id="branch-code-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.code}
              </p>
            ) : (
              <p className="mt-1 text-xs text-neutral-500">
                Identificador único dentro de la empresa.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="branch-name" className="text-xs font-medium">
              Nombre de la sucursal *
            </Label>
            <Input
              id="branch-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sucursal Monterrey Norte"
              maxLength={120}
              className={`mt-1 h-8 text-xs ${
                fieldErrors.name ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={
                fieldErrors.name ? "branch-name-error" : undefined
              }
            />
            {fieldErrors.name ? (
              <p
                id="branch-name-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="branch-address" className="text-xs font-medium">
              Dirección física (opcional)
            </Label>
            <Input
              id="branch-address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. Parque Industrial 400, MTY"
              maxLength={500}
              className={`mt-1 h-8 text-xs ${
                fieldErrors.address ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
              aria-invalid={Boolean(fieldErrors.address)}
              aria-describedby={
                fieldErrors.address ? "branch-address-error" : undefined
              }
            />
            {fieldErrors.address ? (
              <p
                id="branch-address-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.address}
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
              {createMutation.isPending ? "Registrando..." : "Guardar sucursal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
