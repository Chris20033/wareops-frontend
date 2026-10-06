import type { Metadata } from "next";
import { PermissionGate } from "@/components/auth/permission-gate";
import { WarehousesListView } from "@/features/catalog/components/warehouses-list-view";

export const metadata: Metadata = {
  title: "Almacenes | WareOps",
  description: "Administración del catálogo de almacenes.",
};

export default function WarehousesPage() {
  return (
    <PermissionGate
      permission="catalog:read"
      fallback={
        <div className="rounded border border-neutral-200 bg-white p-6 text-xs text-neutral-600">
          No cuentas con el permiso requerido (<code>catalog:read</code>) para
          consultar el catálogo de almacenes.
        </div>
      }
    >
      <WarehousesListView />
    </PermissionGate>
  );
}
