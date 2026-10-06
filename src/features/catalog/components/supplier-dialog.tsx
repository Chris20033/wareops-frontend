"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupplier } from "@/features/catalog/api";
import {
  createSupplierSchema,
  extractFieldErrors,
} from "@/features/catalog/schemas";
import type { SupplierDto } from "@/features/catalog/types";

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (supplier: SupplierDto) => void;
}

export function SupplierDialog({
  isOpen,
  onClose,
  onSuccess,
}: SupplierDialogProps) {
  const queryClient = useQueryClient();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: (newSupplier) => {
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      resetForm();
      onClose();
      onSuccess?.(newSupplier);
    },
    onError: (error) => {
      const extracted = extractFieldErrors(error);
      setFieldErrors(extracted);
      if (Object.keys(extracted).length === 0) {
        setGeneralError(
          error instanceof Error
            ? error.message
            : "No fue posible registrar el proveedor.",
        );
      }
    },
  });

  const resetForm = () => {
    setCode("");
    setName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setFieldErrors({});
    setGeneralError(null);
  };

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const validation = createSupplierSchema.safeParse({
      code,
      name,
      contactName,
      email,
      phone,
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
      code: validation.data.code,
      name: validation.data.name,
      contactName: validation.data.contactName || undefined,
      email: validation.data.email || undefined,
      phone: validation.data.phone || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="supplier-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4"
    >
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-none">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-200/80 pb-3">
          <h2
            id="supplier-dialog-title"
            className="text-base font-semibold text-neutral-950"
          >
            Registrar nuevo proveedor
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
            <Label htmlFor="supplier-code" className="text-xs font-medium">
              Código de proveedor *
            </Label>
            <Input
              id="supplier-code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="PROV-ACME-01"
              maxLength={40}
              className={`mt-1 h-8 font-mono text-xs uppercase ${
                fieldErrors.code ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
              aria-invalid={Boolean(fieldErrors.code)}
              aria-describedby={
                fieldErrors.code ? "supplier-code-error" : undefined
              }
            />
            {fieldErrors.code ? (
              <p
                id="supplier-code-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.code}
              </p>
            ) : (
              <p className="mt-1 text-xs text-neutral-500">
                Código único de proveedor en la empresa.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="supplier-name" className="text-xs font-medium">
              Razón social o nombre comercial *
            </Label>
            <Input
              id="supplier-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Empaques y Cajas Acme S.A."
              maxLength={160}
              className={`mt-1 h-8 text-xs ${
                fieldErrors.name ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={
                fieldErrors.name ? "supplier-name-error" : undefined
              }
            />
            {fieldErrors.name ? (
              <p
                id="supplier-name-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="supplier-contact" className="text-xs font-medium">
              Nombre de contacto (opcional)
            </Label>
            <Input
              id="supplier-contact"
              name="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Lic. Juan Pérez"
              maxLength={120}
              className={`mt-1 h-8 text-xs ${
                fieldErrors.contactName
                  ? "border-red-500 ring-1 ring-red-500"
                  : ""
              }`}
              aria-invalid={Boolean(fieldErrors.contactName)}
              aria-describedby={
                fieldErrors.contactName ? "supplier-contact-error" : undefined
              }
            />
            {fieldErrors.contactName ? (
              <p
                id="supplier-contact-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {fieldErrors.contactName}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="supplier-email" className="text-xs font-medium">
                Correo electrónico
              </Label>
              <Input
                id="supplier-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ventas@acme.com"
                maxLength={320}
                className={`mt-1 h-8 text-xs ${
                  fieldErrors.email ? "border-red-500 ring-1 ring-red-500" : ""
                }`}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={
                  fieldErrors.email ? "supplier-email-error" : undefined
                }
              />
              {fieldErrors.email ? (
                <p
                  id="supplier-email-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600"
                >
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="supplier-phone" className="text-xs font-medium">
                Teléfono de contacto
              </Label>
              <Input
                id="supplier-phone"
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 81 8000 1122"
                maxLength={40}
                className={`mt-1 h-8 text-xs ${
                  fieldErrors.phone ? "border-red-500 ring-1 ring-red-500" : ""
                }`}
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={
                  fieldErrors.phone ? "supplier-phone-error" : undefined
                }
              />
              {fieldErrors.phone ? (
                <p
                  id="supplier-phone-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600"
                >
                  {fieldErrors.phone}
                </p>
              ) : null}
            </div>
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
              {createMutation.isPending
                ? "Registrando..."
                : "Guardar proveedor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
