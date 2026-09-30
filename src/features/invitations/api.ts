import type { CreateInvitationFormValues } from "@/features/invitations/schemas";
import { apiRequest } from "@/lib/api/client";
import type {
  ApiPaginatedResponse,
  ApiSuccessResponse,
  CreatedInvitationDto,
  InvitationDto,
  InvitationStatus,
} from "@/lib/api/types";

export interface ListInvitationsParams {
  page?: number;
  pageSize?: number;
  status?: InvitationStatus | "";
  search?: string;
}

export async function fetchInvitations(
  params: ListInvitationsParams = {},
): Promise<ApiPaginatedResponse<InvitationDto>> {
  return apiRequest<ApiPaginatedResponse<InvitationDto>>("/invitations", {
    method: "GET",
    tenant: true,
    query: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      status: params.status || undefined,
      search: params.search?.trim() || undefined,
    },
  });
}

export async function createInvitation(
  values: CreateInvitationFormValues,
): Promise<CreatedInvitationDto> {
  const response = await apiRequest<ApiSuccessResponse<CreatedInvitationDto>>(
    "/invitations",
    {
      method: "POST",
      tenant: true,
      body: {
        email: values.email.trim().toLowerCase(),
        roleCode: values.roleCode,
      },
    },
  );

  return response.data;
}

export async function revokeInvitation(
  invitationId: string,
): Promise<InvitationDto> {
  const response = await apiRequest<ApiSuccessResponse<InvitationDto>>(
    `/invitations/${invitationId}/revoke`,
    {
      method: "POST",
      tenant: true,
    },
  );

  return response.data;
}
