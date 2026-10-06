import type { Metadata } from "next";
import { PermissionGate } from "@/components/auth/permission-gate";
import { BranchesListView } from "@/features/catalog/components/branches-list-view";

export const metadata: Metadata = {
  title: "Sucursales | WareOps",
  description: "Administración del catálogo de sucursales.",
};

export default function BranchesPage() {
  return (
    <PermissionGate
      permission="catalog:read"
      fallback={
        <div className="rounded border border-neutral-200 bg-white p-6 text-xs text-neutral-600">
          No cuentas con el permiso requerido (<code>catalog:read</code>) para
          consultar el catálogo de sucursales.
        </div>
      }
    >
      <BranchesListView />
    </PermissionGate>
  );
}
