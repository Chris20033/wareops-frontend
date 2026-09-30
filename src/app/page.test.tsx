import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("presenta la propuesta operativa principal de WareOps y el estado activo del frontend", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Control exacto de inventario y operaciones entre múltiples almacenes.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Frontend activo")).toBeInTheDocument();
  });

  it("permite interactuar con el tablero multi-almacén, reservar stock y simular permisos RBAC", () => {
    render(<Home />);

    expect(screen.getByText("Hub Logístico Apodaca")).toBeInTheDocument();
    expect(screen.getByText("1010 = 280 + 730 uds")).toBeInTheDocument();

    const reserveButtons = screen.getAllByRole("button", {
      name: "Reservar 5",
    });
    fireEvent.click(reserveButtons[0]);

    expect(screen.getByText("1010 = 285 + 725 uds")).toBeInTheDocument();
    expect(screen.getByText("Actualizado")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Lector" }));
    expect(screen.getAllByText("Bloqueado (VIEWER)").length).toBeGreaterThan(0);
  });

  it("expone la base técnica y la matriz de módulos operativos", () => {
    render(<Home />);

    expect(screen.getByText("Aplicación")).toBeInTheDocument();
    expect(screen.getByText("TanStack Query")).toBeInTheDocument();
    expect(screen.getByText("Zustand")).toBeInTheDocument();
    expect(screen.getByText("Identidad y Organizaciones")).toBeInTheDocument();
  });
});
