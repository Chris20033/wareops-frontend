"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

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
import { fetchAuthenticatedProfile } from "@/features/auth/api";
import { OrganizationSettingsCard } from "@/features/organizations/components/organization-settings-card";
import type { PermissionCode } from "@/lib/api/types";
import {
  PERMISSION_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "@/lib/auth/permissions";
import { useOrganizationStore } from "@/stores/organization-store";
import { useSessionStore } from "@/stores/session-store";

const ALL_PERMISSIONS: ReadonlyArray<PermissionCode> = [
  "organization:manage",
  "member:manage",
  "catalog:read",
  "catalog:write",
  "inventory:read",
  "inventory:write",
  "order:write",
  "audit:read",
  "dashboard:read",
];

export function ProfileView() {
  const queryClient = useQueryClient();
  const sessionUser = useSessionStore((state) => state.user);
  const sessionId = useSessionStore((state) => state.sessionId);
  const organizations = useOrganizationStore((state) => state.organizations);
  const setActiveOrganization = useOrganizationStore(
    (state) => state.setActiveOrganization,
  );
  const { activeOrganization, permissions } = usePermissions();

  const profileQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchAuthenticatedProfile,
  });

  const user = profileQuery.data?.user ?? sessionUser;
  const currentSessionId = profileQuery.data?.sessionId ?? sessionId;

  if (!user) {
    return (
      <div className="border border-neutral-200 bg-white p-6 font-mono text-xs text-neutral-500">
        [Cargando perfil...]
      </div>
    );
  }

  const activeRoleCode = activeOrganization?.role.code;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200/80 pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
            Perfil y contexto multi-tenant
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Identidad de usuario, organizaciones vinculadas y permisos RBAC
            activos.
          </p>
        </div>

        <PermissionGate permission="member:manage">
          <Link href="/members">
            <Button size="sm" variant="default">
              Administrar miembros
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-neutral-100 pb-3.5">
            <div className="flex items-center justify-between">
              <CardTitle>Cuenta autenticada</CardTitle>
              <Badge variant="outline" className="text-[11px]">
                {user.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <CardDescription>
              Datos del usuario obtenidos desde <code>/auth/me</code>.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <dl className="divide-y divide-neutral-100 text-xs">
              <div className="grid grid-cols-[8rem_1fr] py-2.5">
                <dt className="text-neutral-500">Nombre</dt>
                <dd className="font-medium text-neutral-950">
                  {user.displayName}
                </dd>
              </div>
              <div className="grid grid-cols-[8rem_1fr] py-2.5">
                <dt className="text-neutral-500">Correo</dt>
                <dd className="font-medium text-neutral-950">{user.email}</dd>
              </div>
              <div className="grid grid-cols-[8rem_1fr] py-2.5">
                <dt className="text-neutral-500">ID de usuario</dt>
                <dd className="font-mono text-[11px] text-neutral-600">
                  {user.id}
                </dd>
              </div>
              {currentSessionId ? (
                <div className="grid grid-cols-[8rem_1fr] py-2.5">
                  <dt className="text-neutral-500">Sesión actual</dt>
                  <dd className="font-mono text-[11px] text-neutral-600">
                    {currentSessionId}
                  </dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-neutral-100 pb-3.5">
            <div className="flex items-center justify-between">
              <CardTitle>Permisos efectivos</CardTitle>
              {activeRoleCode ? (
                <Badge variant="secondary" className="text-[11px]">
                  {ROLE_LABELS[activeRoleCode]}
                </Badge>
              ) : null}
            </div>
            <CardDescription>
              {activeOrganization && activeRoleCode
                ? `${activeOrganization.name} · ${ROLE_DESCRIPTIONS[activeRoleCode]}`
                : "Selecciona una organización activa para verificar permisos."}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <ul className="divide-y divide-neutral-100 text-xs">
              {ALL_PERMISSIONS.map((permCode) => {
                const granted = permissions.includes(permCode);
                return (
                  <li
                    key={permCode}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <span className="font-medium text-neutral-900">
                        {PERMISSION_LABELS[permCode]}
                      </span>
                      <code className="ml-2 font-mono text-[11px] text-neutral-500">
                        {permCode}
                      </code>
                    </div>
                    <span
                      className={`font-mono text-[11px] font-medium ${
                        granted ? "text-neutral-950" : "text-neutral-500"
                      }`}
                    >
                      {granted ? "✓ Concedido" : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <OrganizationSettingsCard />

      <Card>
        <CardHeader className="border-b border-neutral-100 pb-3.5">
          <CardTitle>Organizaciones accesibles</CardTitle>
          <CardDescription>
            Membresías activas de tu usuario. Al activar un tenant se asigna
            automáticamente al encabezado <code>X-Organization-Id</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => {
              const isSelected =
                org.organizationId === activeOrganization?.organizationId;
              const roleLabel = ROLE_LABELS[org.role.code] ?? org.role.name;

              return (
                <div
                  key={org.organizationId}
                  className={`flex flex-col justify-between rounded border p-3.5 transition-colors ${
                    isSelected
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold">{org.name}</h3>
                      <Badge
                        variant={isSelected ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        {roleLabel}
                      </Badge>
                    </div>
                    <p
                      className={`font-mono text-[11px] ${
                        isSelected ? "text-neutral-300" : "text-neutral-500"
                      }`}
                    >
                      {org.slug} · {org.timezone}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100/10 pt-3">
                    <span
                      className={`text-[11px] ${
                        isSelected ? "text-neutral-300" : "text-neutral-500"
                      }`}
                    >
                      {org.permissions.length} permisos
                    </span>

                    {isSelected ? (
                      <span className="text-[11px] font-semibold text-white">
                        Activa
                      </span>
                    ) : (
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setActiveOrganization(org.organizationId);
                          void queryClient.invalidateQueries();
                        }}
                      >
                        Activar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
