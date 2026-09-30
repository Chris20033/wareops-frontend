"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { Select } from "@/components/ui/select";
import {
  createInvitation,
  fetchInvitations,
  revokeInvitation,
} from "@/features/invitations/api";
import {
  createInvitationSchema,
  type CreateInvitationFormValues,
} from "@/features/invitations/schemas";
import { ApiClientError, applyApiErrorToForm } from "@/lib/api/errors";
import type { CreatedInvitationDto, InvitationStatus } from "@/lib/api/types";
import { INVITABLE_ROLES, ROLE_LABELS } from "@/lib/auth/permissions";

const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  REVOKED: "Revocada",
  EXPIRED: "Expirada",
};

export function InvitationsPanel() {
  const queryClient = useQueryClient();
  const { activeOrganization, can } = usePermissions();
  const canManageMembers = can("member:manage");

  const [statusFilter, setStatusFilter] = useState<InvitationStatus | "">("");
  const [searchEmail, setSearchEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [latestInvitation, setLatestInvitation] =
    useState<CreatedInvitationDto | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateInvitationFormValues>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: {
      email: "",
      roleCode: "OPERATOR",
    },
  });

  const invitationsQuery = useQuery({
    queryKey: [
      "invitations",
      activeOrganization?.organizationId,
      statusFilter,
      searchEmail,
    ],
    queryFn: () =>
      fetchInvitations({
        status: statusFilter,
        search: searchEmail,
      }),
    enabled: Boolean(activeOrganization?.organizationId) && canManageMembers,
  });

  const createMutation = useMutation({
    mutationFn: createInvitation,
    onSuccess: (created) => {
      setLatestInvitation(created);
      setCopiedLink(false);
      setServerError(null);
      reset({
        email: "",
        roleCode: "OPERATOR",
      });
      void queryClient.invalidateQueries({
        queryKey: ["invitations", activeOrganization?.organizationId],
      });
    },
    onError: (error) => {
      const message = applyApiErrorToForm(error, setError, [
        "email",
        "roleCode",
      ]);
      setServerError(message);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeInvitation,
    onSuccess: () => {
      setServerError(null);
      void queryClient.invalidateQueries({
        queryKey: ["invitations", activeOrganization?.organizationId],
      });
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        setServerError(error.message);
      } else {
        setServerError("No fue posible revocar la invitación.");
      }
    },
  });

  const handleCopyInvitationUrl = async (url: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedLink(true);
    } catch {
      setCopiedLink(false);
    }
  };

  return (
    <PermissionGate permission="member:manage">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invitar nuevo miembro</CardTitle>
            <CardDescription>
              Genera un enlace de invitación de un solo uso válido por 72 horas
              para incorporar personas a{" "}
              <strong>{activeOrganization?.name}</strong>.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {serverError ? (
              <div
                role="alert"
                className="rounded border border-red-200 bg-red-50/70 px-3.5 py-2.5 text-xs text-red-900"
              >
                {serverError}
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit((values) => createMutation.mutate(values))}
              noValidate
              className="grid gap-4 sm:grid-cols-[1fr_13rem_auto] sm:items-end"
            >
              <div className="space-y-1.5">
                <Label htmlFor="invitation-email">Correo del invitado</Label>
                <Input
                  id="invitation-email"
                  type="email"
                  placeholder="colaborador@empresa.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "invitation-email-error" : undefined
                  }
                  {...register("email")}
                />
                {errors.email ? (
                  <p
                    id="invitation-email-error"
                    className="text-xs text-red-600"
                  >
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invitation-roleCode">Rol inicial</Label>
                <Select
                  id="invitation-roleCode"
                  aria-invalid={Boolean(errors.roleCode)}
                  {...register("roleCode")}
                >
                  {INVITABLE_ROLES.map((roleCode) => (
                    <option key={roleCode} value={roleCode}>
                      {ROLE_LABELS[roleCode]} ({roleCode})
                    </option>
                  ))}
                </Select>
                {errors.roleCode ? (
                  <p className="text-xs text-red-600">
                    {errors.roleCode.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {createMutation.isPending
                    ? "Generando enlace..."
                    : "Crear invitación"}
                </Button>
              </div>
            </form>

            {latestInvitation ? (
              <div
                role="region"
                aria-label="Enlace de invitación generado"
                className="space-y-3 rounded-lg border border-neutral-900 bg-neutral-950 p-4 text-xs text-neutral-100"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">
                    Enlace de un solo uso para{" "}
                    <span className="font-semibold text-neutral-200">
                      {latestInvitation.email}
                    </span>{" "}
                    ({ROLE_LABELS[latestInvitation.role.code]})
                  </p>
                  <Badge
                    variant="outline"
                    className="border-neutral-700 bg-neutral-900 text-neutral-300"
                  >
                    Válido 72 horas · Un solo uso
                  </Badge>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    readOnly
                    aria-label="URL de invitación"
                    value={latestInvitation.invitationUrl}
                    className="h-8 border-neutral-700 bg-neutral-900 font-mono text-xs text-neutral-200 selection:bg-neutral-700"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleCopyInvitationUrl(latestInvitation.invitationUrl)
                    }
                    className="shrink-0 font-medium"
                  >
                    {copiedLink ? "Enlace copiado" : "Copiar enlace"}
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Invitaciones emitidas</CardTitle>
              <CardDescription>
                Historial y estado de las invitaciones registradas en la
                organización.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="search"
                aria-label="Buscar invitación por correo"
                placeholder="Filtrar por correo..."
                value={searchEmail}
                onChange={(event) => setSearchEmail(event.target.value)}
                className="h-8 w-48 text-xs"
              />
              <Select
                aria-label="Filtrar invitaciones por estado"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as InvitationStatus | "")
                }
                className="h-8 w-36 text-xs"
              >
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="ACCEPTED">Aceptadas</option>
                <option value="REVOKED">Revocadas</option>
                <option value="EXPIRED">Expiradas</option>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {invitationsQuery.isLoading ? (
              <p className="py-6 text-center text-xs text-neutral-500">
                Cargando invitaciones...
              </p>
            ) : invitationsQuery.data?.data.length ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200/90 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                      <th className="py-2.5 pr-4">Correo</th>
                      <th className="px-4 py-2.5">Rol</th>
                      <th className="px-4 py-2.5">Estado</th>
                      <th className="px-4 py-2.5">Invitado por</th>
                      <th className="py-2.5 pl-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/60">
                    {invitationsQuery.data.data.map((invitation) => (
                      <tr
                        key={invitation.id}
                        className="transition-colors hover:bg-neutral-50/70"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-neutral-900">
                          {invitation.email}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-700">
                          {ROLE_LABELS[invitation.role.code] ??
                            invitation.role.name}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              invitation.status === "PENDING"
                                ? "outline"
                                : invitation.status === "ACCEPTED"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {INVITATION_STATUS_LABELS[invitation.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">
                          {invitation.invitedBy.displayName}
                        </td>
                        <td className="py-3 pl-4 text-right">
                          {invitation.status === "PENDING" ? (
                            <Button
                              type="button"
                              size="xs"
                              variant="destructive"
                              disabled={revokeMutation.isPending}
                              onClick={() =>
                                revokeMutation.mutate(invitation.id)
                              }
                            >
                              Revocar
                            </Button>
                          ) : (
                            <span className="text-xs text-neutral-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-xs text-neutral-500">
                No se encontraron invitaciones con los filtros seleccionados.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
