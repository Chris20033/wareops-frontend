import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("presenta el estado de la fundación frontend", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "La fundación de WareOps está lista.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Frontend activo")).toBeInTheDocument();
  });

  it("expone la base técnica como una lista descriptiva", () => {
    render(<Home />);

    expect(screen.getByText("Aplicación")).toBeInTheDocument();
    expect(screen.getByText("TanStack Query")).toBeInTheDocument();
    expect(screen.getByText("Zustand")).toBeInTheDocument();
  });
});
