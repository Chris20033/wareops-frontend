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
import { fetchSupplierById, updateSupplier } from "@/features/catalog/api";
import {
  extractFieldErrors,
  updateSupplierSchema,
} from "@/features/catalog/schemas";

interface SupplierDetailViewProps {
  supplierId: string;
}

export function SupplierDetailView({ supplierId }: SupplierDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const {
    data: supplier,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: () => fetchSupplierById(supplierId),
    enabled: Boolean(supplierId) && can("catalog:read"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      contactName?: string;
      email?: string;
      phone?: string;
    }) => updateSupplier(supplierId, payload),
    onSuccess: () => {
      setFeedbackSuccess("Proveedor actualizado exitosamente.");
      setFeedbackError(null);
      setFieldErrors({});
      setIsEditing(false);
      void queryClient.invalidateQueries({
        queryKey: ["supplier", supplierId],
      });
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err) => {
      const extracted = extractFieldErrors(err);
      setFieldErrors(extracted);
      if (Object.keys(extracted).length === 0) {
        setFeedbackError(
          err instanceof Error
            ? err.message
            : "Error al actualizar el proveedor.",
        );
      }
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (nextActive: boolean) =>
      updateSupplier(supplierId, { isActive: nextActive }),
    onSuccess: (updated) => {
      setFeedbackSuccess(
        updated.isActive
          ? "Proveedor activado exitosamente."
          : "Proveedor desactivado exitosamente.",
      );
      setFeedbackError(null);
      void queryClient.invalidateQueries({
        queryKey: ["supplier", supplierId],
      });
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err) => {
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado del proveedor.",
      );
    },
  });

  const handleStartEdit = () => {
    if (supplier) {
      setName(supplier.name);
      setContactName(supplier.contactName || "");
      setEmail(supplier.email || "");
      setPhone(supplier.phone || "");
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

    const validation = updateSupplierSchema.safeParse({
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

    updateMutation.mutate({
      name: validation.data.name,
      contactName: validation.data.contactName || undefined,
      email: validation.data.email || undefined,
      phone: validation.data.phone || undefined,
    });
  };

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex items-center justify-center p-12 font-mono text-xs text-neutral-500"
      >
        [Cargando detalle del proveedor...]
      </div>
    );
  }

  if (isError || !supplier) {
    return (
      <div className="space-y-4">
        <Button
          size="xs"
          variant="outline"
          onClick={() => router.push("/suppliers")}
        >
          ← Volver a proveedores
        </Button>
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-4 text-xs text-red-700"
        >
          {error instanceof Error ? error.message : "Proveedor no encontrado."}
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
            onClick={() => router.push("/suppliers")}
          >
            ← Volver
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-950">
                {supplier.name}
              </h1>
              <Badge
                variant={supplier.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {supplier.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="font-mono text-xs text-neutral-500">
              Código:{" "}
              <span className="font-semibold text-neutral-900">
                {supplier.code}
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
              variant={supplier.isActive ? "destructive" : "secondary"}
              disabled={toggleStatusMutation.isPending}
              onClick={() => toggleStatusMutation.mutate(!supplier.isActive)}
            >
              {supplier.isActive ? "Desactivar proveedor" : "Activar proveedor"}
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
              Datos del proveedor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <Label htmlFor="edit-supp-name" className="text-xs">
                    Razón social o nombre comercial *
                  </Label>
                  <Input
                    id="edit-supp-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`mt-1 h-8 text-xs ${
                      fieldErrors.name
                        ? "border-red-500 ring-1 ring-red-500"
                        : ""
                    }`}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={
                      fieldErrors.name ? "edit-supp-name-error" : undefined
                    }
                  />
                  {fieldErrors.name ? (
                    <p
                      id="edit-supp-name-error"
                      role="alert"
                      className="mt-1 text-xs text-red-600"
                    >
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="edit-supp-contact" className="text-xs">
                    Persona de contacto
                  </Label>
                  <Input
                    id="edit-supp-contact"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className={`mt-1 h-8 text-xs ${
                      fieldErrors.contactName
                        ? "border-red-500 ring-1 ring-red-500"
                        : ""
                    }`}
                    aria-invalid={Boolean(fieldErrors.contactName)}
                    aria-describedby={
                      fieldErrors.contactName
                        ? "edit-supp-contact-error"
                        : undefined
                    }
                  />
                  {fieldErrors.contactName ? (
                    <p
                      id="edit-supp-contact-error"
                      role="alert"
                      className="mt-1 text-xs text-red-600"
                    >
                      {fieldErrors.contactName}
                    </p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="edit-supp-email" className="text-xs">
                    Correo electrónico
                  </Label>
                  <Input
                    id="edit-supp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`mt-1 h-8 text-xs ${
                      fieldErrors.email
                        ? "border-red-500 ring-1 ring-red-500"
                        : ""
                    }`}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? "edit-supp-email-error" : undefined
                    }
                  />
                  {fieldErrors.email ? (
                    <p
                      id="edit-supp-email-error"
                      role="alert"
                      className="mt-1 text-xs text-red-600"
                    >
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="edit-supp-phone" className="text-xs">
                    Teléfono
                  </Label>
                  <Input
                    id="edit-supp-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`mt-1 h-8 text-xs ${
                      fieldErrors.phone
                        ? "border-red-500 ring-1 ring-red-500"
                        : ""
                    }`}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={
                      fieldErrors.phone ? "edit-supp-phone-error" : undefined
                    }
                  />
                  {fieldErrors.phone ? (
                    <p
                      id="edit-supp-phone-error"
                      role="alert"
                      className="mt-1 text-xs text-red-600"
                    >
                      {fieldErrors.phone}
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
                  <span className="text-neutral-500">Contacto principal:</span>
                  <p className="mt-0.5 font-medium text-neutral-900">
                    {supplier.contactName || "Sin contacto registrado"}
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-3">
                  <span className="text-neutral-500">Correo electrónico:</span>
                  <p className="mt-0.5 text-neutral-900">
                    {supplier.email || "Sin correo registrado"}
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-3">
                  <span className="text-neutral-500">Teléfono:</span>
                  <p className="mt-0.5 font-mono text-neutral-900">
                    {supplier.phone || "Sin teléfono registrado"}
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-3">
                  <span className="text-neutral-500">
                    Productos abastecidos:
                  </span>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-neutral-900 tabular-nums">
                    {supplier.productsCount}
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-3 font-mono text-xs text-neutral-500">
                  <p>
                    Registrado:{" "}
                    {new Date(supplier.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Actualizado:{" "}
                    {new Date(supplier.updatedAt).toLocaleDateString()}
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
