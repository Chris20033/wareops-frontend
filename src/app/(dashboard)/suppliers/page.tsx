import type { Metadata } from "next";
import { PermissionGate } from "@/components/auth/permission-gate";
import { SuppliersListView } from "@/features/catalog/components/suppliers-list-view";

export const metadata: Metadata = {
  title: "Proveedores | WareOps",
  description:
    "Administración del catálogo de proveedores y fuentes de suministro.",
};

export default function SuppliersPage() {
  return (
    <PermissionGate
      permission="catalog:read"
      fallback={
        <div className="rounded border border-neutral-200 bg-white p-6 text-xs text-neutral-600">
          No cuentas con el permiso requerido (<code>catalog:read</code>) para
          consultar el catálogo de proveedores.
        </div>
      }
    >
      <SuppliersListView />
    </PermissionGate>
  );
}
