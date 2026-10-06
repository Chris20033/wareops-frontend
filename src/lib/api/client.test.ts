import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  apiRequest,
  clearClientAuthState,
  setUnauthorizedHandler,
} from "@/lib/api/client";
import { ApiClientError } from "@/lib/api/errors";
import { useOrganizationStore } from "@/stores/organization-store";
import { useSessionStore } from "@/stores/session-store";

describe("apiRequest HTTP client", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    clearClientAuthState(false);
    setUnauthorizedHandler(null);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("attaches Authorization Bearer token, X-Organization-Id and X-Request-Id headers", async () => {
    useSessionStore.getState().setSession({
      accessToken: "token-inicial-123",
      user: {
        id: "user-1",
        email: "owner@wareops.local",
        displayName: "Propietario Norte",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    useOrganizationStore.getState().setOrganizations([
      {
        membershipId: "mem-1",
        organizationId: "11111111-1111-4111-8111-111111111111",
        name: "Organización Norte",
        slug: "organizacion-norte",
        timezone: "America/Mexico_City",
        role: { id: "role-owner", code: "OWNER", name: "Propietario" },
        permissions: ["organization:manage", "member:manage"],
      },
    ]);

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { ok: true },
          requestId: "req-1",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    global.fetch = fetchMock;

    const result = await apiRequest<{ data: { ok: boolean } }>(
      "/organizations/current",
      {
        method: "GET",
        tenant: true,
      },
    );

    expect(result.data.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(requestInit.headers);

    expect(headers.get("Authorization")).toBe("Bearer token-inicial-123");
    expect(headers.get("X-Organization-Id")).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(headers.get("X-Request-Id")).toBeTruthy();
  });

  it("refreshes session once on 401 and retries the original request with the new token", async () => {
    useSessionStore.getState().setSession({
      accessToken: "expired-token",
      user: {
        id: "user-1",
        email: "owner@wareops.local",
        displayName: "Propietario Norte",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    const fetchMock = vi
      .fn()
      // 1st call: protected endpoint returns 401
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            statusCode: 401,
            code: "AUTHENTICATION_REQUIRED",
            message: "Token expirado.",
            requestId: "req-401",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      // 2nd call: POST /auth/refresh returns new session
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              accessToken: "fresh-token-456",
              expiresIn: 900,
              user: {
                id: "user-1",
                email: "owner@wareops.local",
                displayName: "Propietario Norte",
                isActive: true,
                createdAt: "2026-01-01T00:00:00.000Z",
              },
              organizations: [],
            },
            requestId: "req-refresh",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      // 3rd call: retried protected endpoint succeeds
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { sessionId: "sess-1" },
            requestId: "req-me",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

    global.fetch = fetchMock;

    const response = await apiRequest<{ data: { sessionId: string } }>(
      "/auth/me",
      { method: "GET" },
    );

    expect(response.data.sessionId).toBe("sess-1");
    expect(useSessionStore.getState().accessToken).toBe("fresh-token-456");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const [, retryInit] = fetchMock.mock.calls[2] as [string, RequestInit];
    const retryHeaders = new Headers(retryInit.headers);
    expect(retryHeaders.get("Authorization")).toBe("Bearer fresh-token-456");
  });

  it("clears session and invokes unauthorized handler when 401 refresh fails", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    useSessionStore.getState().setSession({
      accessToken: "expired-token",
      user: {
        id: "user-1",
        email: "owner@wareops.local",
        displayName: "Propietario Norte",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            statusCode: 401,
            code: "AUTHENTICATION_REQUIRED",
            message: "No autenticado.",
            requestId: "req-1",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            statusCode: 401,
            code: "REFRESH_SESSION_INVALID",
            message: "Sesión expirada.",
            requestId: "req-2",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

    global.fetch = fetchMock;

    await expect(
      apiRequest("/auth/me", { method: "GET" }),
    ).rejects.toBeInstanceOf(ApiClientError);

    expect(useSessionStore.getState().accessToken).toBeNull();
    expect(useSessionStore.getState().status).toBe("unauthenticated");
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
