"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
import { Select } from "@/components/ui/select";
import { InvitationsPanel } from "@/features/invitations/components/invitations-panel";
import { fetchMembers, updateMember } from "@/features/members/api";
import { ApiClientError } from "@/lib/api/errors";
import type { MemberDto, MembershipStatus, RoleCode } from "@/lib/api/types";
import {
  ALL_ROLES,
  INVITABLE_ROLES,
  ROLE_LABELS,
} from "@/lib/auth/permissions";

interface MemberRowActionsProps {
  member: MemberDto;
  isCurrentUserOwner: boolean;
  isMutating: boolean;
  onChangeRole: (membershipId: string, roleCode: RoleCode) => void;
  onToggleStatus: (membershipId: string, nextStatus: MembershipStatus) => void;
}

function MemberRowActions({
  member,
  isCurrentUserOwner,
  isMutating,
  onChangeRole,
  onToggleStatus,
}: MemberRowActionsProps) {
  const [selectedRole, setSelectedRole] = useState<RoleCode>(member.role.code);

  const isTargetOwner = member.role.code === "OWNER";
  const canModifyThisMember = isCurrentUserOwner || !isTargetOwner;
  const availableRoles: ReadonlyArray<RoleCode> = isCurrentUserOwner
    ? ALL_ROLES
    : INVITABLE_ROLES;

  const nextStatus: MembershipStatus =
    member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  return (
    <PermissionGate permission="member:manage">
      {canModifyThisMember ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (selectedRole !== member.role.code) {
                onChangeRole(member.id, selectedRole);
              }
            }}
            className="flex items-center gap-1.5"
          >
            <Select
              aria-label={`Cambiar rol de ${member.user.displayName}`}
              value={selectedRole}
              disabled={isMutating}
              onChange={(event) =>
                setSelectedRole(event.target.value as RoleCode)
              }
              className="h-7 w-36 text-xs"
            >
              {availableRoles.map((roleCode) => (
                <option key={roleCode} value={roleCode}>
                  {ROLE_LABELS[roleCode]}
                </option>
              ))}
            </Select>
            <Button
              type="submit"
              size="xs"
              variant="outline"
              disabled={isMutating || selectedRole === member.role.code}
            >
              Guardar rol
            </Button>
          </form>

          <Button
            type="button"
            size="xs"
            variant={member.status === "ACTIVE" ? "destructive" : "secondary"}
            disabled={isMutating}
            onClick={() => onToggleStatus(member.id, nextStatus)}
          >
            {member.status === "ACTIVE" ? "Desactivar" : "Activar"}
          </Button>
        </div>
      ) : (
        <span className="text-xs text-neutral-500">
          Sólo Propietario modifica OWNER
        </span>
      )}
    </PermissionGate>
  );
}

export function MembersView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { activeOrganization, can, isOwner } = usePermissions();
  const canManageMembers = can("member:manage");

  const search = searchParams.get("search") ?? "";
  const status = (searchParams.get("status") ?? "") as MembershipStatus | "";
  const roleCode = (searchParams.get("roleCode") ?? "") as RoleCode | "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value && value.trim() !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const membersQuery = useQuery({
    queryKey: [
      "members",
      activeOrganization?.organizationId,
      { page, status, roleCode, search },
    ],
    queryFn: () =>
      fetchMembers({
        page,
        pageSize: 20,
        status,
        roleCode,
        search,
      }),
    enabled: Boolean(activeOrganization?.organizationId) && canManageMembers,
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({
      membershipId,
      payload,
    }: {
      membershipId: string;
      payload: { roleCode?: RoleCode; status?: MembershipStatus };
    }) => updateMember(membershipId, payload),
    onSuccess: (updated) => {
      setFeedbackError(null);
      setFeedbackSuccess(
        `Membresía de ${updated.user.displayName} actualizada (${ROLE_LABELS[updated.role.code]} · ${
          updated.status === "ACTIVE" ? "Activa" : "Inactiva"
        }).`,
      );
      void queryClient.invalidateQueries({
        queryKey: ["members", activeOrganization?.organizationId],
      });
    },
    onError: (error) => {
      setFeedbackSuccess(null);
      if (error instanceof ApiClientError) {
        setFeedbackError(error.message);
      } else {
        setFeedbackError("No fue posible actualizar la membresía.");
      }
    },
  });

  if (!canManageMembers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Administración de miembros restringida</CardTitle>
          <CardDescription>
            Tu rol actual en{" "}
            <strong>{activeOrganization?.name ?? "esta organización"}</strong>{" "}
            no cuenta con el permiso <code>member:manage</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600">
            Cambia a una organización donde tengas rol de{" "}
            <strong>Propietario</strong> o <strong>Administrador</strong> desde
            el selector superior para gestionar membresías e invitaciones.
          </p>
        </CardContent>
      </Card>
    );
  }

  const members = membersQuery.data?.data ?? [];
  const meta = membersQuery.data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-neutral-950 sm:text-3xl">
          Miembros e invitaciones
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Administra los accesos, roles y estado de membresías en{" "}
          <strong>{activeOrganization?.name}</strong>.
        </p>
      </div>

      {feedbackError ? (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50/70 px-3.5 py-2.5 text-xs text-red-900"
        >
          {feedbackError}
        </div>
      ) : null}

      {feedbackSuccess ? (
        <div
          role="status"
          className="rounded border border-neutral-900 bg-neutral-950 px-3.5 py-2.5 text-xs text-neutral-100"
        >
          {feedbackSuccess}
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Miembros de la organización</CardTitle>
            <CardDescription>
              Siempre debe permanecer al menos un propietario (
              <code>OWNER</code>) activo en la organización.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="search"
              aria-label="Buscar miembro por nombre o correo"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(event) =>
                updateUrlParams({ search: event.target.value, page: "1" })
              }
              className="h-8 w-52 text-xs"
            />

            <Select
              aria-label="Filtrar miembros por rol"
              value={roleCode}
              onChange={(event) =>
                updateUrlParams({ roleCode: event.target.value, page: "1" })
              }
              className="h-8 w-36 text-xs"
            >
              <option value="">Todos los roles</option>
              {ALL_ROLES.map((code) => (
                <option key={code} value={code}>
                  {ROLE_LABELS[code]}
                </option>
              ))}
            </Select>

            <Select
              aria-label="Filtrar miembros por estado"
              value={status}
              onChange={(event) =>
                updateUrlParams({ status: event.target.value, page: "1" })
              }
              className="h-8 w-36 text-xs"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {membersQuery.isLoading ? (
            <p className="py-6 text-center text-xs text-neutral-500">
              Cargando miembros...
            </p>
          ) : members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200/90 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                    <th className="py-2.5 pr-4">Miembro</th>
                    <th className="px-4 py-2.5">Rol actual</th>
                    <th className="px-4 py-2.5">Estado</th>
                    <th className="py-2.5 pl-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60">
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-neutral-50/70"
                    >
                      <td className="py-3 pr-4">
                        <div className="font-medium text-neutral-950">
                          {member.user.displayName}
                        </div>
                        <div className="font-mono text-xs text-neutral-500">
                          {member.user.email}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {ROLE_LABELS[member.role.code] ?? member.role.name}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            member.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {member.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>

                      <td className="py-3 pl-4 text-right">
                        <MemberRowActions
                          key={`${member.id}-${member.role.code}-${member.status}`}
                          member={member}
                          isCurrentUserOwner={isOwner}
                          isMutating={updateMemberMutation.isPending}
                          onChangeRole={(membershipId, nextRole) =>
                            updateMemberMutation.mutate({
                              membershipId,
                              payload: { roleCode: nextRole },
                            })
                          }
                          onToggleStatus={(membershipId, nextStatus) =>
                            updateMemberMutation.mutate({
                              membershipId,
                              payload: { status: nextStatus },
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-neutral-500">
              No se encontraron miembros con los filtros seleccionados.
            </p>
          )}

          {meta && meta.totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-neutral-200/80 pt-3 text-xs text-neutral-600">
              <span className="font-mono">
                Página {meta.page} de {meta.totalPages} ({meta.totalItems}{" "}
                miembros)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={meta.page <= 1}
                  onClick={() =>
                    updateUrlParams({ page: String(meta.page - 1) })
                  }
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() =>
                    updateUrlParams({ page: String(meta.page + 1) })
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <InvitationsPanel />
    </div>
  );
}
