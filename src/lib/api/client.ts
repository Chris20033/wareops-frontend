import { ApiClientError, isApiErrorResponse } from "@/lib/api/errors";
import type { ApiSuccessResponse, AuthSessionDto } from "@/lib/api/types";
import { useOrganizationStore } from "@/stores/organization-store";
import { useSessionStore } from "@/stores/session-store";

const DEFAULT_API_BASE_URL = "http://localhost:3001/api/v1";

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const baseUrl =
    configured && configured.length > 0 ? configured : DEFAULT_API_BASE_URL;
  return baseUrl.replace(/\/+$/, "");
}

function generateRequestId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  tenant?: boolean;
  organizationId?: string;
  idempotencyKey?: string;
  skipAuthRefresh?: boolean;
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | null,
): void {
  unauthorizedHandler = handler;
}

export function clearClientAuthState(notifyRedirect = false): void {
  useSessionStore.getState().clearSession();
  useOrganizationStore.getState().clearOrganizations();
  if (notifyRedirect && unauthorizedHandler) {
    unauthorizedHandler();
  }
}

export function applyAuthSession(session: AuthSessionDto): void {
  useSessionStore.getState().setSession({
    accessToken: session.accessToken,
    user: session.user,
  });
  useOrganizationStore.getState().setOrganizations(session.organizations);
}

let inFlightRefreshPromise: Promise<AuthSessionDto | null> | null = null;

/**
 * Coordinates a single concurrent `POST /auth/refresh` request using the HttpOnly cookie.
 */
export async function refreshSessionOnce(options?: {
  notifyOnFailure?: boolean;
}): Promise<AuthSessionDto | null> {
  if (inFlightRefreshPromise) {
    return inFlightRefreshPromise;
  }

  const notifyOnFailure = options?.notifyOnFailure ?? false;

  inFlightRefreshPromise = (async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Request-Id": generateRequestId(),
        },
      });

      if (!response.ok) {
        clearClientAuthState(notifyOnFailure);
        return null;
      }

      const payload =
        (await response.json()) as ApiSuccessResponse<AuthSessionDto>;
      if (!payload?.data?.accessToken) {
        clearClientAuthState(notifyOnFailure);
        return null;
      }

      applyAuthSession(payload.data);
      return payload.data;
    } catch {
      clearClientAuthState(notifyOnFailure);
      return null;
    } finally {
      inFlightRefreshPromise = null;
    }
  })();

  return inFlightRefreshPromise;
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${getApiBaseUrl()}${normalizedPath}`;

  if (!query) {
    return fullUrl;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${fullUrl}?${queryString}` : fullUrl;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  return null;
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const {
    body,
    query,
    auth = true,
    tenant = false,
    organizationId,
    idempotencyKey,
    skipAuthRefresh = false,
    headers: customHeaders,
    ...fetchInit
  } = options;

  const executeFetch = async (tokenOverride?: string): Promise<Response> => {
    const headers = new Headers(customHeaders);
    headers.set("Accept", "application/json");

    if (!headers.has("X-Request-Id")) {
      headers.set("X-Request-Id", generateRequestId());
    }

    const token = tokenOverride ?? useSessionStore.getState().accessToken;
    if (auth && token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (tenant) {
      const resolvedOrgId =
        organizationId ??
        useOrganizationStore.getState().getActiveOrganization()
          ?.organizationId ??
        useOrganizationStore.getState().activeOrganizationId;

      if (resolvedOrgId) {
        headers.set("X-Organization-Id", resolvedOrgId);
      }
    }

    if (idempotencyKey) {
      headers.set("Idempotency-Key", idempotencyKey);
    }

    let serializedBody: BodyInit | undefined;
    if (body !== undefined) {
      headers.set("Content-Type", "application/json");
      serializedBody = JSON.stringify(body);
    }

    return fetch(buildUrl(path, query), {
      ...fetchInit,
      headers,
      body: serializedBody,
      credentials: "include",
    });
  };

  let response = await executeFetch();

  const isAuthEndpoint =
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/refresh") ||
    path.startsWith("/invitations/accept");

  if (response.status === 401 && auth && !skipAuthRefresh && !isAuthEndpoint) {
    const refreshedSession = await refreshSessionOnce({
      notifyOnFailure: true,
    });
    if (refreshedSession?.accessToken) {
      response = await executeFetch(refreshedSession.accessToken);
    }
  }

  const parsed = await parseResponseBody(response);

  if (!response.ok) {
    if (isApiErrorResponse(parsed)) {
      throw new ApiClientError({
        statusCode: parsed.statusCode,
        code: parsed.code,
        message: parsed.message,
        details: parsed.details,
        requestId:
          parsed.requestId ?? response.headers.get("X-Request-Id") ?? undefined,
      });
    }

    throw new ApiClientError({
      statusCode: response.status,
      code: "INTERNAL_ERROR",
      message: "No fue posible completar la operación solicitada.",
      requestId: response.headers.get("X-Request-Id") ?? undefined,
    });
  }

  return parsed as TResponse;
}
