import type { Metadata } from "next";
import { PermissionGate } from "@/components/auth/permission-gate";
import { ProductDetailView } from "@/features/catalog/components/product-detail-view";

interface ProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export const metadata: Metadata = {
  title: "Detalle de Producto | WareOps",
  description: "Ficha técnica y gestión del producto.",
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { productId } = await params;

  return (
    <PermissionGate
      permission="catalog:read"
      fallback={
        <div className="rounded border border-neutral-200 bg-white p-6 text-xs text-neutral-600">
          No cuentas con el permiso requerido (<code>catalog:read</code>) para
          consultar el detalle de productos.
        </div>
      }
    >
      <ProductDetailView productId={productId} />
    </PermissionGate>
  );
}
