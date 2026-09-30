"use client";

import type { ReactNode } from "react";

import type { PermissionCode, RoleCode } from "@/lib/api/types";
import { useOrganizationStore } from "@/stores/organization-store";

export function usePermissions() {
  const organizations = useOrganizationStore((state) => state.organizations);
  const activeOrganizationId = useOrganizationStore(
    (state) => state.activeOrganizationId,
  );

  const activeOrganization =
    organizations.find((org) => org.organizationId === activeOrganizationId) ??
    organizations[0] ??
    null;

  const permissions = activeOrganization?.permissions ?? [];
  const roleCode: RoleCode | null = activeOrganization?.role.code ?? null;

  const can = (permission: PermissionCode): boolean =>
    permissions.includes(permission);

  const canAll = (required: ReadonlyArray<PermissionCode>): boolean =>
    required.every((perm) => permissions.includes(perm));

  const isOwner = roleCode === "OWNER";

  return {
    activeOrganization,
    permissions,
    roleCode,
    isOwner,
    can,
    canAll,
  };
}

interface PermissionGateProps {
  permission?: PermissionCode;
  permissions?: ReadonlyArray<PermissionCode>;
  requireOwner?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireOwner = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAll, isOwner } = usePermissions();

  if (requireOwner && !isOwner) {
    return <>{fallback}</>;
  }

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  if (permissions && !canAll(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
