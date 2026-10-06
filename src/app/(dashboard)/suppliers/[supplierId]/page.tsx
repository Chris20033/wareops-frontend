import type { Metadata } from "next";
import { PermissionGate } from "@/components/auth/permission-gate";
import { SupplierDetailView } from "@/features/catalog/components/supplier-detail-view";

interface SupplierPageProps {
  params: Promise<{
    supplierId: string;
  }>;
}

export const metadata: Metadata = {
  title: "Detalle de Proveedor | WareOps",
  description: "Ficha técnica y gestión del proveedor.",
};

export default async function SupplierDetailPage({
  params,
}: SupplierPageProps) {
  const { supplierId } = await params;

  return (
    <PermissionGate
      permission="catalog:read"
      fallback={
        <div className="rounded border border-neutral-200 bg-white p-6 text-xs text-neutral-600">
          No cuentas con el permiso requerido (<code>catalog:read</code>) para
          consultar el detalle de proveedores.
        </div>
      }
    >
      <SupplierDetailView supplierId={supplierId} />
    </PermissionGate>
  );
}
