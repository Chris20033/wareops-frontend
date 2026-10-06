"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  PermissionGate,
  usePermissions,
} from "@/components/auth/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchCurrentOrganization,
  updateCurrentOrganization,
} from "@/features/organizations/api";
import {
  updateOrganizationSchema,
  type UpdateOrganizationFormValues,
} from "@/features/organizations/schemas";
import { applyApiErrorToForm } from "@/lib/api/errors";
import { ROLE_LABELS } from "@/lib/auth/permissions";

export function OrganizationSettingsCard() {
  const queryClient = useQueryClient();
  const { activeOrganization, can } = usePermissions();
  const canManageOrg = can("organization:manage");

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const organizationQuery = useQuery({
    queryKey: ["organizations", "current", activeOrganization?.organizationId],
    queryFn: fetchCurrentOrganization,
    enabled: Boolean(activeOrganization?.organizationId),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateOrganizationFormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: activeOrganization?.name ?? "",
      slug: activeOrganization?.slug ?? "",
      timezone: activeOrganization?.timezone ?? "America/Mexico_City",
    },
  });

  useEffect(() => {
    if (organizationQuery.data) {
      reset({
        name: organizationQuery.data.name,
        slug: organizationQuery.data.slug,
        timezone: organizationQuery.data.timezone,
      });
    }
  }, [organizationQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: updateCurrentOrganization,
    onSuccess: (updated) => {
      reset({
        name: updated.name,
        slug: updated.slug,
        timezone: updated.timezone,
      });
      setSuccessMessage("Organización actualizada correctamente.");
      setServerError(null);
      void queryClient.invalidateQueries({
        queryKey: ["organizations", "current", updated.id],
      });
    },
    onError: (error) => {
      setSuccessMessage(null);
      const message = applyApiErrorToForm(error, setError, [
        "name",
        "slug",
        "timezone",
      ]);
      setServerError(message);
    },
  });

  if (!activeOrganization) {
    return null;
  }

  const orgData = organizationQuery.data;
  const roleLabel =
    ROLE_LABELS[activeOrganization.role.code] ?? activeOrganization.role.name;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Configuración de organización</CardTitle>
          <CardDescription>
            Contexto tenant para la cabecera{" "}
            <code className="font-mono text-neutral-900">
              X-Organization-Id
            </code>
            .
          </CardDescription>
        </div>
        <Badge variant="outline" className="w-fit">
          Rol: {roleLabel}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {organizationQuery.isLoading ? (
          <p className="font-mono text-xs text-neutral-500">
            [Cargando detalles...]
          </p>
        ) : null}

        {serverError ? (
          <div
            role="alert"
            className="rounded border border-red-200 bg-red-50/70 px-3.5 py-2.5 text-xs text-red-900"
          >
            {serverError}
          </div>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="rounded border border-neutral-900 bg-neutral-950 px-3.5 py-2.5 text-xs text-neutral-100"
          >
            {successMessage}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
          noValidate
          className="space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="org-name">Nombre</Label>
              <Input
                id="org-name"
                disabled={!canManageOrg || updateMutation.isPending}
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                className="font-mono text-xs"
                disabled={!canManageOrg || updateMutation.isPending}
                aria-invalid={Boolean(errors.slug)}
                {...register("slug")}
              />
              {errors.slug ? (
                <p className="text-xs text-red-600">{errors.slug.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="org-timezone">Zona horaria</Label>
              <Input
                id="org-timezone"
                disabled={!canManageOrg || updateMutation.isPending}
                aria-invalid={Boolean(errors.timezone)}
                {...register("timezone")}
              />
              {errors.timezone ? (
                <p className="text-xs text-red-600">
                  {errors.timezone.message}
                </p>
              ) : null}
            </div>
          </div>

          {orgData ? (
            <div className="grid gap-2 border border-neutral-100 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-600 sm:grid-cols-2">
              <div>
                <span className="text-neutral-500">org_id:</span>{" "}
                <span className="text-neutral-900">{orgData.id}</span>
              </div>
              <div>
                <span className="text-neutral-500">membership_id:</span>{" "}
                <span className="text-neutral-900">
                  {orgData.membership.id}
                </span>
              </div>
            </div>
          ) : null}

          <PermissionGate
            permission="organization:manage"
            fallback={
              <p className="text-xs text-neutral-500">
                La modificación de parámetros del tenant está reservada para el
                rol <code>OWNER</code>.
              </p>
            }
          >
            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={!isDirty || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </PermissionGate>
        </form>
      </CardContent>
    </Card>
  );
}
