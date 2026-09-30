import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { clearClientAuthState } from "@/lib/api/client";
import { useSessionStore } from "@/stores/session-store";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
  }),
}));

describe("Authentication forms (LoginForm & RegisterForm)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    clearClientAuthState(false);
    pushMock.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("validates LoginForm fields with Zod before submitting", async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: /entrar a wareops/i }));

    expect(
      await screen.findByText(/ingresa tu correo electrónico/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/ingresa tu contraseña/i),
    ).toBeInTheDocument();
  });

  it("displays API error alert when login fails with 401 INVALID_CREDENTIALS", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          statusCode: 401,
          code: "INVALID_CREDENTIALS",
          message: "Credenciales inválidas.",
          requestId: "req-err-1",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "owner@wareops.local" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "ClaveIncorrecta" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar a wareops/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciales inválidas.",
    );
  });

  it("submits RegisterForm, stores session in memory and redirects to /profile", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            accessToken: "jwt-register-token",
            expiresIn: 900,
            user: {
              id: "user-new",
              email: "ana@empresa.com",
              displayName: "Ana García",
              isActive: true,
              createdAt: "2026-01-01T00:00:00.000Z",
            },
            organizations: [
              {
                membershipId: "mem-new",
                organizationId: "org-new",
                name: "Bodega Central",
                slug: "bodega-central",
                timezone: "America/Mexico_City",
                role: { id: "r-1", code: "OWNER", name: "Propietario" },
                permissions: ["organization:manage", "member:manage"],
              },
            ],
          },
          requestId: "req-reg-1",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: "Ana García" },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "ana@empresa.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "WareOpsDemo!2026" },
    });
    fireEvent.change(screen.getByLabelText(/nombre de la organización/i), {
      target: { value: "Bodega Central" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /registrar y entrar al panel/i }),
    );

    await waitFor(() => {
      expect(useSessionStore.getState().accessToken).toBe("jwt-register-token");
      expect(pushMock).toHaveBeenCalledWith("/profile");
    });
  });
});
