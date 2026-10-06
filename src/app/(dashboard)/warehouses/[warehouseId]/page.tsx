import type { Metadata } from "next";
import { PermissionGate } from "@/components/auth/permission-gate";
import { WarehouseDetailView } from "@/features/catalog/components/warehouse-detail-view";

interface WarehousePageProps {
  params: Promise<{
    warehouseId: string;
  }>;
}

export const metadata: Metadata = {
  title: "Detalle de Almacén | WareOps",
  description: "Ficha técnica y gestión del almacén.",
};

export default async function WarehouseDetailPage({
  params,
}: WarehousePageProps) {
  const { warehouseId } = await params;

  return (
    <PermissionGate
      permission="catalog:read"
      fallback={
        <div className="rounded border border-neutral-200 bg-white p-6 text-xs text-neutral-600">
          No cuentas con el permiso requerido (<code>catalog:read</code>) para
          consultar el detalle de almacenes.
        </div>
      }
    >
      <WarehouseDetailView warehouseId={warehouseId} />
    </PermissionGate>
  );
}
