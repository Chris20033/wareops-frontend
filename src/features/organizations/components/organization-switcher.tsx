"use client";

import { useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { useOrganizationStore } from "@/stores/organization-store";

export function OrganizationSwitcher() {
  const queryClient = useQueryClient();
  const organizations = useOrganizationStore((state) => state.organizations);
  const activeOrganizationId = useOrganizationStore(
    (state) => state.activeOrganizationId,
  );
  const setActiveOrganization = useOrganizationStore(
    (state) => state.setActiveOrganization,
  );

  const activeOrganization =
    organizations.find((org) => org.organizationId === activeOrganizationId) ??
    organizations[0] ??
    null;

  if (!activeOrganization) {
    return null;
  }

  const handleSwitch = (newOrganizationId: string) => {
    if (newOrganizationId === activeOrganization.organizationId) {
      return;
    }
    setActiveOrganization(newOrganizationId);
    void queryClient.invalidateQueries();
  };

  const roleLabel =
    ROLE_LABELS[activeOrganization.role.code] ?? activeOrganization.role.name;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="active-organization-select" className="sr-only">
        Organización activa
      </label>
      <Select
        id="active-organization-select"
        aria-label="Organización activa"
        value={activeOrganization.organizationId}
        onChange={(event) => handleSwitch(event.target.value)}
        className="h-7.5 min-w-[11rem] bg-white text-xs sm:min-w-[13rem]"
      >
        {organizations.map((org) => (
          <option key={org.organizationId} value={org.organizationId}>
            {org.name} ({ROLE_LABELS[org.role.code] ?? org.role.name})
          </option>
        ))}
      </Select>

      <Badge variant="secondary" className="hidden text-[11px] sm:inline-flex">
        {roleLabel}
      </Badge>
    </div>
  );
}
