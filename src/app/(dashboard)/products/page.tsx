import type { Metadata } from "next";
import { PermissionGate } from "@/components/auth/permission-gate";
import { ProductsListView } from "@/features/catalog/components/products-list-view";

export const metadata: Metadata = {
  title: "Productos | WareOps",
  description: "Administración del catálogo de productos y artículos.",
};

export default function ProductsPage() {
  return (
    <PermissionGate
      permission="catalog:read"
      fallback={
        <div className="rounded border border-neutral-200 bg-white p-6 text-xs text-neutral-600">
          No cuentas con el permiso requerido (<code>catalog:read</code>) para
          consultar el catálogo de productos.
        </div>
      }
    >
      <ProductsListView />
    </PermissionGate>
  );
}
