import type { Metadata } from "next";
import { PermissionGate } from "@/components/auth/permission-gate";
import { BranchDetailView } from "@/features/catalog/components/branch-detail-view";

interface BranchPageProps {
  params: Promise<{
    branchId: string;
  }>;
}

export const metadata: Metadata = {
  title: "Detalle de Sucursal | WareOps",
  description: "Ficha técnica y gestión de la sucursal.",
};

export default async function BranchDetailPage({ params }: BranchPageProps) {
  const { branchId } = await params;

  return (
    <PermissionGate
      permission="catalog:read"
      fallback={
        <div className="rounded border border-neutral-200 bg-white p-6 text-xs text-neutral-600">
          No cuentas con el permiso requerido (<code>catalog:read</code>) para
          consultar el detalle de sucursales.
        </div>
      }
    >
      <BranchDetailView branchId={branchId} />
    </PermissionGate>
  );
}
