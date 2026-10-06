import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MembersView } from "@/features/members/components/members-view";
import { clearClientAuthState } from "@/lib/api/client";
import { useOrganizationStore } from "@/stores/organization-store";
import { useSessionStore } from "@/stores/session-store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/members",
  useSearchParams: () => new URLSearchParams(),
}));

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("MembersView & Permission-based visibility", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    clearClientAuthState(false);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("hides member and invitation mutation controls when user lacks member:manage permission", () => {
    useSessionStore.getState().setSession({
      accessToken: "viewer-token",
      user: {
        id: "u-viewer",
        email: "viewer@wareops.local",
        displayName: "Lector Sur",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    useOrganizationStore.getState().setOrganizations([
      {
        membershipId: "m-viewer",
        organizationId: "org-sur",
        name: "Organización Sur",
        slug: "organizacion-sur",
        timezone: "America/Monterrey",
        role: { id: "r-viewer", code: "VIEWER", name: "Lector" },
        permissions: ["catalog:read", "inventory:read", "dashboard:read"],
      },
    ]);

    renderWithQueryClient(<MembersView />);

    expect(
      screen.getByText(/administración de miembros restringida/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /crear invitación/i }),
    ).not.toBeInTheDocument();
  });

  it("renders members list and generates a copyable invitation link when user has member:manage", async () => {
    useSessionStore.getState().setSession({
      accessToken: "owner-token",
      user: {
        id: "u-owner",
        email: "owner@wareops.local",
        displayName: "Propietario Norte",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    useOrganizationStore.getState().setOrganizations([
      {
        membershipId: "m-owner",
        organizationId: "11111111-1111-4111-8111-111111111111",
        name: "Organización Norte",
        slug: "organizacion-norte",
        timezone: "America/Mexico_City",
        role: { id: "r-owner", code: "OWNER", name: "Propietario" },
        permissions: ["organization:manage", "member:manage"],
      },
    ]);

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    global.fetch = vi
      .fn()
      .mockImplementation((url: string, init?: RequestInit) => {
        if (url.includes("/members")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: [
                  {
                    id: "mem-1",
                    organizationId: "11111111-1111-4111-8111-111111111111",
                    status: "ACTIVE",
                    user: {
                      id: "u-owner",
                      email: "owner@wareops.local",
                      displayName: "Propietario Norte",
                      isActive: true,
                    },
                    role: { id: "r-owner", code: "OWNER", name: "Propietario" },
                    createdAt: "2026-01-01T00:00:00.000Z",
                    updatedAt: "2026-01-01T00:00:00.000Z",
                  },
                ],
                meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
                requestId: "req-members",
              }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            ),
          );
        }

        if (url.includes("/invitations") && init?.method === "POST") {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: {
                  id: "inv-1",
                  organizationId: "11111111-1111-4111-8111-111111111111",
                  email: "nuevo@wareops.local",
                  status: "PENDING",
                  role: { id: "r-op", code: "OPERATOR", name: "Operador" },
                  invitedBy: {
                    id: "u-owner",
                    email: "owner@wareops.local",
                    displayName: "Propietario Norte",
                  },
                  expiresAt: "2026-01-04T00:00:00.000Z",
                  acceptedAt: null,
                  revokedAt: null,
                  createdAt: "2026-01-01T00:00:00.000Z",
                  invitationToken: "token-secreto-1234567890",
                  invitationUrl:
                    "http://localhost:3000/invitations/accept?token=token-secreto-1234567890",
                },
                requestId: "req-inv-create",
              }),
              { status: 201, headers: { "Content-Type": "application/json" } },
            ),
          );
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [],
              meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
              requestId: "req-inv-list",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        );
      });

    renderWithQueryClient(<MembersView />);

    expect(await screen.findByText("Propietario Norte")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/correo del invitado/i), {
      target: { value: "nuevo@wareops.local" },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear invitación/i }));

    const urlInput = await screen.findByLabelText(/url de invitación/i);
    expect(urlInput).toHaveValue(
      "http://localhost:3000/invitations/accept?token=token-secreto-1234567890",
    );

    fireEvent.click(screen.getByRole("button", { name: /copiar enlace/i }));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(
        "http://localhost:3000/invitations/accept?token=token-secreto-1234567890",
      );
      expect(
        screen.getByRole("button", { name: /enlace copiado/i }),
      ).toBeInTheDocument();
    });
  });
});
