export type RoleCode = "OWNER" | "ADMIN" | "MANAGER" | "OPERATOR" | "VIEWER";

export type PermissionCode =
  | "organization:manage"
  | "member:manage"
  | "catalog:read"
  | "catalog:write"
  | "inventory:read"
  | "inventory:write"
  | "order:write"
  | "audit:read"
  | "dashboard:read";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_REQUIRED"
  | "INVALID_CREDENTIALS"
  | "REFRESH_SESSION_INVALID"
  | "PERMISSION_DENIED"
  | "RESOURCE_NOT_FOUND"
  | "DUPLICATE_RESOURCE"
  | "INSUFFICIENT_STOCK"
  | "INVALID_STATE_TRANSITION"
  | "IDEMPOTENCY_KEY_REUSED"
  | "CONCURRENT_MODIFICATION"
  | "BUSINESS_RULE_VIOLATION"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "DEPENDENCY_UNAVAILABLE";

export interface ApiSuccessResponse<T> {
  data: T;
  requestId: string;
}

export interface PaginationMetaDto {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: PaginationMetaDto;
  requestId: string;
}

export interface ApiErrorDetails {
  field?: string;
  fields?: Record<string, string[]>;
  [key: string]: unknown;
}

export interface ApiErrorResponseDto {
  statusCode: number;
  code: ApiErrorCode | string;
  message: string;
  details?: ApiErrorDetails;
  requestId: string;
}

export interface AuthRoleSummaryDto {
  id: string;
  code: RoleCode;
  name: string;
}

export interface AccessibleOrganizationSummaryDto {
  membershipId: string;
  organizationId: string;
  name: string;
  slug: string;
  timezone: string;
  role: AuthRoleSummaryDto;
  permissions: PermissionCode[];
}

export interface AuthUserDto {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthSessionDto {
  accessToken: string;
  expiresIn: number;
  user: AuthUserDto;
  organizations: AccessibleOrganizationSummaryDto[];
}

export interface AuthenticatedProfileDto {
  sessionId: string;
  user: AuthUserDto;
  organizations: AccessibleOrganizationSummaryDto[];
}

export interface LogoutResultDto {
  loggedOut: boolean;
}

export type MembershipStatus = "ACTIVE" | "INACTIVE";

export interface CurrentMembershipSummaryDto {
  id: string;
  status: MembershipStatus;
  role: AuthRoleSummaryDto;
  permissions: PermissionCode[];
}

export interface CurrentOrganizationDto {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  membership: CurrentMembershipSummaryDto;
}

export interface MemberUserSummaryDto {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
}

export interface MemberDto {
  id: string;
  organizationId: string;
  status: MembershipStatus;
  user: MemberUserSummaryDto;
  role: AuthRoleSummaryDto;
  createdAt: string;
  updatedAt: string;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export interface InvitationIssuerSummaryDto {
  id: string;
  email: string;
  displayName: string;
}

export interface InvitationDto {
  id: string;
  organizationId: string;
  email: string;
  status: InvitationStatus;
  role: AuthRoleSummaryDto;
  invitedBy: InvitationIssuerSummaryDto;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface CreatedInvitationDto extends InvitationDto {
  invitationToken: string;
  invitationUrl: string;
}

export interface AcceptedInvitationResultDto {
  invitation: InvitationDto;
  membership: MemberDto;
}
