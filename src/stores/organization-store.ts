import { create } from "zustand";

import type {
  AccessibleOrganizationSummaryDto,
  PermissionCode,
  RoleCode,
} from "@/lib/api/types";

const ACTIVE_ORG_STORAGE_KEY = "wareops.activeOrganizationId";

function readStoredOrganizationId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredOrganizationId(organizationId: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (organizationId) {
      window.sessionStorage.setItem(ACTIVE_ORG_STORAGE_KEY, organizationId);
    } else {
      window.sessionStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota or privacy mode errors
  }
}

export interface OrganizationState {
  organizations: AccessibleOrganizationSummaryDto[];
  activeOrganizationId: string | null;
  setOrganizations: (
    organizations: AccessibleOrganizationSummaryDto[],
    preferredOrganizationId?: string | null,
  ) => void;
  setActiveOrganization: (organizationId: string) => void;
  updateActiveOrganizationDetails: (details: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
  }) => void;
  clearOrganizations: () => void;
  getActiveOrganization: () => AccessibleOrganizationSummaryDto | null;
  hasPermission: (permission: PermissionCode) => boolean;
  hasRole: (roleCode: RoleCode) => boolean;
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organizations: [],
  activeOrganizationId: null,
  setOrganizations: (organizations, preferredOrganizationId) => {
    const currentId =
      preferredOrganizationId ??
      get().activeOrganizationId ??
      readStoredOrganizationId();

    const matchingOrg = organizations.find(
      (org) => org.organizationId === currentId,
    );
    const resolvedOrgId =
      matchingOrg?.organizationId ?? organizations[0]?.organizationId ?? null;

    writeStoredOrganizationId(resolvedOrgId);
    set({
      organizations,
      activeOrganizationId: resolvedOrgId,
    });
  },
  setActiveOrganization: (organizationId) => {
    const exists = get().organizations.some(
      (org) => org.organizationId === organizationId,
    );
    if (!exists) {
      return;
    }
    writeStoredOrganizationId(organizationId);
    set({ activeOrganizationId: organizationId });
  },
  updateActiveOrganizationDetails: ({ id, name, slug, timezone }) =>
    set((state) => ({
      organizations: state.organizations.map((org) =>
        org.organizationId === id ? { ...org, name, slug, timezone } : org,
      ),
    })),
  clearOrganizations: () => {
    writeStoredOrganizationId(null);
    set({
      organizations: [],
      activeOrganizationId: null,
    });
  },
  getActiveOrganization: () => {
    const { organizations, activeOrganizationId } = get();
    if (!activeOrganizationId) {
      return organizations[0] ?? null;
    }
    return (
      organizations.find(
        (org) => org.organizationId === activeOrganizationId,
      ) ??
      organizations[0] ??
      null
    );
  },
  hasPermission: (permission) => {
    const activeOrg = get().getActiveOrganization();
    if (!activeOrg) {
      return false;
    }
    return activeOrg.permissions.includes(permission);
  },
  hasRole: (roleCode) => {
    const activeOrg = get().getActiveOrganization();
    if (!activeOrg) {
      return false;
    }
    return activeOrg.role.code === roleCode;
  },
}));
