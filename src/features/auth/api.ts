import {
  apiRequest,
  applyAuthSession,
  clearClientAuthState,
} from "@/lib/api/client";
import type {
  AcceptedInvitationResultDto,
  ApiSuccessResponse,
  AuthenticatedProfileDto,
  AuthSessionDto,
  LogoutResultDto,
} from "@/lib/api/types";
import type {
  LoginFormValues,
  RegisterFormValues,
} from "@/features/auth/schemas";
import { useOrganizationStore } from "@/stores/organization-store";
import { useSessionStore } from "@/stores/session-store";

export async function loginUser(
  values: LoginFormValues,
): Promise<AuthSessionDto> {
  const response = await apiRequest<ApiSuccessResponse<AuthSessionDto>>(
    "/auth/login",
    {
      method: "POST",
      auth: false,
      skipAuthRefresh: true,
      body: {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      },
    },
  );

  applyAuthSession(response.data);
  return response.data;
}

export async function registerUser(
  values: RegisterFormValues,
): Promise<AuthSessionDto> {
  const trimmedSlug = values.organizationSlug.trim().toLowerCase();
  const trimmedTimezone = values.timezone.trim();

  const response = await apiRequest<ApiSuccessResponse<AuthSessionDto>>(
    "/auth/register",
    {
      method: "POST",
      auth: false,
      skipAuthRefresh: true,
      body: {
        displayName: values.displayName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        organizationName: values.organizationName.trim(),
        ...(trimmedSlug ? { organizationSlug: trimmedSlug } : {}),
        ...(trimmedTimezone ? { timezone: trimmedTimezone } : {}),
      },
    },
  );

  applyAuthSession(response.data);
  return response.data;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest<ApiSuccessResponse<LogoutResultDto>>("/auth/logout", {
      method: "POST",
      skipAuthRefresh: true,
    });
  } finally {
    clearClientAuthState(false);
  }
}

export async function fetchAuthenticatedProfile(): Promise<AuthenticatedProfileDto> {
  const response = await apiRequest<
    ApiSuccessResponse<AuthenticatedProfileDto>
  >("/auth/me", {
    method: "GET",
  });

  useSessionStore
    .getState()
    .updateUser(response.data.user, response.data.sessionId);
  useOrganizationStore.getState().setOrganizations(response.data.organizations);

  return response.data;
}

export async function acceptInvitationRequest(payload: {
  token: string;
  displayName?: string;
  password?: string;
  useCurrentSession?: boolean;
}): Promise<AcceptedInvitationResultDto> {
  const { token, displayName, password, useCurrentSession = false } = payload;

  const response = await apiRequest<
    ApiSuccessResponse<AcceptedInvitationResultDto>
  >("/invitations/accept", {
    method: "POST",
    auth: useCurrentSession,
    skipAuthRefresh: !useCurrentSession,
    body: {
      token: token.trim(),
      ...(displayName ? { displayName: displayName.trim() } : {}),
      ...(password ? { password } : {}),
    },
  });

  return response.data;
}
