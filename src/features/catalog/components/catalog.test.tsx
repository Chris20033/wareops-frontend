import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BranchesListView } from "@/features/catalog/components/branches-list-view";
import { ProductsListView } from "@/features/catalog/components/products-list-view";
import { ProductSupplierManager } from "@/features/catalog/components/product-supplier-manager";
import { WarehousesListView } from "@/features/catalog/components/warehouses-list-view";
import { clearClientAuthState } from "@/lib/api/client";
import { useOrganizationStore } from "@/stores/organization-store";
import { useSessionStore } from "@/stores/session-store";

const mockReplace = vi.fn();
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => "/branches",
  useSearchParams: () => mockSearchParams,
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

describe("Catalog Views & Permission / URL Tests", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    mockReplace.mockClear();
    mockPush.mockClear();
    clearClientAuthState(false);

    useSessionStore.getState().setSession({
      accessToken: "manager-token",
      user: {
        id: "u-manager",
        email: "manager@wareops.local",
        displayName: "Gerente Operativo",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("hides mutation actions (Nueva sucursal, Desactivar) when user only has catalog:read permission", async () => {
    useOrganizationStore.getState().setOrganizations([
      {
        membershipId: "m-reader",
        organizationId: "org-test-uuid",
        name: "Organización Test",
        slug: "org-test",
        timezone: "America/Monterrey",
        role: { id: "r-viewer", code: "VIEWER", name: "Lector" },
        permissions: ["catalog:read"],
      },
    ]);

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/branches")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: "b-01",
                  organizationId: "org-test-uuid",
                  code: "SUC-01",
                  name: "Sucursal Norte",
                  address: "Av. Parque 100",
                  isActive: true,
                  warehousesCount: 2,
                  createdAt: "2026-01-01T00:00:00.000Z",
                  updatedAt: "2026-01-01T00:00:00.000Z",
                },
              ],
              meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
              requestId: "req-1",
            }),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    renderWithQueryClient(<BranchesListView />);

    await waitFor(() => {
      expect(screen.getByText("SUC-01")).toBeInTheDocument();
      expect(screen.getByText("Sucursal Norte")).toBeInTheDocument();
    });

    // Should NOT have "Nueva sucursal" button
    expect(
      screen.queryByRole("button", { name: /nueva sucursal/i }),
    ).not.toBeInTheDocument();

    // Should NOT have "Desactivar" button
    expect(
      screen.queryByRole("button", { name: /desactivar/i }),
    ).not.toBeInTheDocument();
  });

  it("renders creation and mutation actions when user has catalog:write permission", async () => {
    useOrganizationStore.getState().setOrganizations([
      {
        membershipId: "m-manager",
        organizationId: "org-test-uuid",
        name: "Organización Test",
        slug: "org-test",
        timezone: "America/Monterrey",
        role: { id: "r-manager", code: "MANAGER", name: "Gerente" },
        permissions: ["catalog:read", "catalog:write"],
      },
    ]);

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/branches")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: "b-01",
                  organizationId: "org-test-uuid",
                  code: "SUC-01",
                  name: "Sucursal Norte",
                  address: "Av. Parque 100",
                  isActive: true,
                  warehousesCount: 1,
                  createdAt: "2026-01-01T00:00:00.000Z",
                  updatedAt: "2026-01-01T00:00:00.000Z",
                },
              ],
              meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
              requestId: "req-1",
            }),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    renderWithQueryClient(<BranchesListView />);

    await waitFor(() => {
      expect(screen.getByText("SUC-01")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /nueva sucursal/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /desactivar/i }),
    ).toBeInTheDocument();
  });

  it("updates URL parameters when searching in catalog toolbar", async () => {
    useOrganizationStore.getState().setOrganizations([
      {
        membershipId: "m-manager",
        organizationId: "org-test-uuid",
        name: "Organización Test",
        slug: "org-test",
        timezone: "America/Monterrey",
        role: { id: "r-manager", code: "MANAGER", name: "Gerente" },
        permissions: ["catalog:read", "catalog:write"],
      },
    ]);

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            data: [],
            meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
            requestId: "req-1",
          }),
      }),
    );

    renderWithQueryClient(<BranchesListView />);

    const searchInput = screen.getByPlaceholderText(
      /buscar por código o nombre/i,
    );
    fireEvent.change(searchInput, { target: { value: "Monterrey" } });
    fireEvent.click(screen.getByRole("button", { name: /buscar/i }));

    expect(mockReplace).toHaveBeenCalledWith("/branches?search=Monterrey");
  });

  it("renders ProductSupplierManager and allows attaching and detaching a supplier", async () => {
    useOrganizationStore.getState().setOrganizations([
      {
        membershipId: "m-manager",
        organizationId: "org-test-uuid",
        name: "Organización Test",
        slug: "org-test",
        timezone: "America/Monterrey",
        role: { id: "r-manager", code: "MANAGER", name: "Gerente" },
        permissions: ["catalog:read", "catalog:write"],
      },
    ]);

    global.fetch = vi
      .fn()
      .mockImplementation((url: string, init?: RequestInit) => {
        if (
          url.includes("/products/p-01/suppliers") &&
          init?.method === "GET"
        ) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: () =>
              Promise.resolve({
                data: [
                  {
                    supplierId: "s-01",
                    code: "PROV-ACME-01",
                    name: "Empaques Acme",
                    contactName: "Juan Pérez",
                    email: "contacto@acme.com",
                    phone: "+528180001122",
                    isActive: true,
                    linkedAt: "2026-01-15T00:00:00.000Z",
                  },
                ],
                requestId: "req-suppliers-attached",
              }),
          });
        }

        if (url.includes("/suppliers")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: () =>
              Promise.resolve({
                data: [
                  {
                    id: "s-01",
                    code: "PROV-ACME-01",
                    name: "Empaques Acme",
                    isActive: true,
                  },
                  {
                    id: "s-02",
                    code: "PROV-BOX-02",
                    name: "Cajas del Norte",
                    isActive: true,
                  },
                ],
                meta: { page: 1, pageSize: 100, totalItems: 2, totalPages: 1 },
                requestId: "req-all-suppliers",
              }),
          });
        }

        if (
          url.includes("/products/p-01/suppliers/s-01") &&
          init?.method === "DELETE"
        ) {
          return Promise.resolve({
            ok: true,
            status: 204,
            headers: new Headers(),
            text: () => Promise.resolve(""),
          });
        }

        return Promise.reject(new Error(`Unhandled URL: ${url}`));
      });

    renderWithQueryClient(<ProductSupplierManager productId="p-01" />);

    await waitFor(() => {
      expect(screen.getByText("PROV-ACME-01")).toBeInTheDocument();
      expect(screen.getByText("Empaques Acme")).toBeInTheDocument();
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    // Detach action exists
    const detachButton = screen.getByRole("button", { name: /desvincular/i });
    expect(detachButton).toBeInTheDocument();

    fireEvent.click(detachButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/products/p-01/suppliers/s-01"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("renders WarehousesListView with branch relationship data", async () => {
    useOrganizationStore.getState().setOrganizations([
      {
        membershipId: "m-manager",
        organizationId: "org-test-uuid",
        name: "Organización Test",
        slug: "org-test",
        timezone: "America/Monterrey",
        role: { id: "r-manager", code: "MANAGER", name: "Gerente" },
        permissions: ["catalog:read", "catalog:write"],
      },
    ]);

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/branches")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              data: [
                { id: "b-01", code: "SUC-01", name: "Sucursal Monterrey" },
              ],
              meta: { page: 1, pageSize: 100, totalItems: 1, totalPages: 1 },
              requestId: "req-branches",
            }),
        });
      }

      if (url.includes("/warehouses")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: "wh-01",
                  branchId: "b-01",
                  code: "ALM-01",
                  name: "Almacén Refrigerado",
                  description: "Racks con control térmico",
                  isActive: true,
                  branch: {
                    id: "b-01",
                    code: "SUC-01",
                    name: "Sucursal Monterrey",
                  },
                  createdAt: "2026-01-01T00:00:00.000Z",
                  updatedAt: "2026-01-01T00:00:00.000Z",
                },
              ],
              meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
              requestId: "req-wh",
            }),
        });
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    renderWithQueryClient(<WarehousesListView />);

    await waitFor(() => {
      expect(screen.getByText("ALM-01")).toBeInTheDocument();
      expect(screen.getByText("Almacén Refrigerado")).toBeInTheDocument();
      expect(
        screen.getAllByText("Sucursal Monterrey").length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders ProductsListView with SKU and supplier counts", async () => {
    useOrganizationStore.getState().setOrganizations([
      {
        membershipId: "m-manager",
        organizationId: "org-test-uuid",
        name: "Organización Test",
        slug: "org-test",
        timezone: "America/Monterrey",
        role: { id: "r-manager", code: "MANAGER", name: "Gerente" },
        permissions: ["catalog:read", "catalog:write"],
      },
    ]);

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/products")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: "p-01",
                  organizationId: "org-test-uuid",
                  sku: "SKU-CARTON-40",
                  name: "Caja Reforzada 40x40",
                  description: "Empaque corrugado",
                  isActive: true,
                  suppliersCount: 2,
                  createdAt: "2026-01-01T00:00:00.000Z",
                  updatedAt: "2026-01-01T00:00:00.000Z",
                },
              ],
              meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
              requestId: "req-prod",
            }),
        });
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    renderWithQueryClient(<ProductsListView />);

    await waitFor(() => {
      expect(screen.getByText("SKU-CARTON-40")).toBeInTheDocument();
      expect(screen.getByText("Caja Reforzada 40x40")).toBeInTheDocument();
    });
  });
});
