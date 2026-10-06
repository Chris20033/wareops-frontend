import type { UpdateOrganizationFormValues } from "@/features/organizations/schemas";
import { apiRequest } from "@/lib/api/client";
import type {
  AccessibleOrganizationSummaryDto,
  ApiSuccessResponse,
  CurrentOrganizationDto,
} from "@/lib/api/types";
import { useOrganizationStore } from "@/stores/organization-store";

export async function fetchAccessibleOrganizations(): Promise<
  AccessibleOrganizationSummaryDto[]
> {
  const response = await apiRequest<
    ApiSuccessResponse<AccessibleOrganizationSummaryDto[]>
  >("/organizations", {
    method: "GET",
  });

  useOrganizationStore.getState().setOrganizations(response.data);
  return response.data;
}

export async function fetchCurrentOrganization(): Promise<CurrentOrganizationDto> {
  const response = await apiRequest<ApiSuccessResponse<CurrentOrganizationDto>>(
    "/organizations/current",
    {
      method: "GET",
      tenant: true,
    },
  );

  return response.data;
}

export async function updateCurrentOrganization(
  values: UpdateOrganizationFormValues,
): Promise<CurrentOrganizationDto> {
  const response = await apiRequest<ApiSuccessResponse<CurrentOrganizationDto>>(
    "/organizations/current",
    {
      method: "PATCH",
      tenant: true,
      body: {
        name: values.name.trim(),
        slug: values.slug.trim().toLowerCase(),
        timezone: values.timezone.trim(),
      },
    },
  );

  useOrganizationStore.getState().updateActiveOrganizationDetails({
    id: response.data.id,
    name: response.data.name,
    slug: response.data.slug,
    timezone: response.data.timezone,
  });

  return response.data;
}
