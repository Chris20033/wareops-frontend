import { apiRequest } from "@/lib/api/client";
import type {
  ApiPaginatedResponse,
  ApiSuccessResponse,
  MemberDto,
  MembershipStatus,
  RoleCode,
} from "@/lib/api/types";

export interface ListMembersParams {
  page?: number;
  pageSize?: number;
  status?: MembershipStatus | "";
  roleCode?: RoleCode | "";
  search?: string;
}

export async function fetchMembers(
  params: ListMembersParams = {},
): Promise<ApiPaginatedResponse<MemberDto>> {
  return apiRequest<ApiPaginatedResponse<MemberDto>>("/members", {
    method: "GET",
    tenant: true,
    query: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      status: params.status || undefined,
      roleCode: params.roleCode || undefined,
      search: params.search?.trim() || undefined,
    },
  });
}

export async function updateMember(
  membershipId: string,
  payload: {
    roleCode?: RoleCode;
    status?: MembershipStatus;
  },
): Promise<MemberDto> {
  const response = await apiRequest<ApiSuccessResponse<MemberDto>>(
    `/members/${membershipId}`,
    {
      method: "PATCH",
      tenant: true,
      body: payload,
    },
  );

  return response.data;
}
