import { useQuery } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Providers } from "@/app/providers";

function QueryConsumer() {
  const query = useQuery({
    queryKey: ["foundation-check"],
    queryFn: async () => "Proveedor disponible",
  });

  return <output>{query.data ?? "Cargando"}</output>;
}

describe("Providers", () => {
  it("pone un QueryClient a disposición del árbol React", async () => {
    render(
      <Providers>
        <QueryConsumer />
      </Providers>,
    );

    expect(await screen.findByText("Proveedor disponible")).toBeInTheDocument();
  });
});
