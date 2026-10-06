"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  attachProductSupplier,
  detachProductSupplier,
  fetchProductSuppliers,
  fetchSuppliers,
} from "@/features/catalog/api";
import type { ProductSupplierItemDto } from "@/features/catalog/types";

interface ProductSupplierManagerProps {
  productId: string;
}

export function ProductSupplierManager({
  productId,
}: ProductSupplierManagerProps) {
  const queryClient = useQueryClient();

  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Suppliers linked to this product
  const { data: attachedSuppliers = [], isLoading } = useQuery({
    queryKey: ["product-suppliers", productId],
    queryFn: () => fetchProductSuppliers(productId),
    enabled: Boolean(productId),
  });

  // All active suppliers in the organization
  const { data: allSuppliersData } = useQuery({
    queryKey: ["suppliers", { pageSize: 100, isActive: true }],
    queryFn: () => fetchSuppliers({ pageSize: 100, isActive: true }),
    enabled: Boolean(productId),
  });

  const availableSuppliers = (allSuppliersData?.data ?? []).filter(
    (supplier) =>
      !attachedSuppliers.some(
        (attached) => attached.supplierId === supplier.id,
      ),
  );

  const attachMutation = useMutation({
    mutationFn: (supplierId: string) =>
      attachProductSupplier(productId, { supplierId }),
    onSuccess: () => {
      setSelectedSupplierId("");
      setFeedbackSuccess("Proveedor vinculado exitosamente al producto.");
      setFeedbackError(null);
      void queryClient.invalidateQueries({
        queryKey: ["product-suppliers", productId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["product", productId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (err) => {
      setFeedbackError(
        err instanceof Error ? err.message : "Error al vincular el proveedor.",
      );
    },
  });

  const detachMutation = useMutation({
    mutationFn: (supplierId: string) =>
      detachProductSupplier(productId, supplierId),
    onSuccess: () => {
      setFeedbackSuccess("Proveedor desvinculado exitosamente.");
      setFeedbackError(null);
      void queryClient.invalidateQueries({
        queryKey: ["product-suppliers", productId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["product", productId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (err) => {
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "Error al desvincular el proveedor.",
      );
    },
  });

  const handleAttachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) return;
    attachMutation.mutate(selectedSupplierId);
  };

  return (
    <Card className="rounded-lg border border-neutral-200/80 bg-white">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-neutral-950">
            Proveedores autorizados ({attachedSuppliers.length})
          </CardTitle>
          <p className="mt-0.5 text-xs text-neutral-500">
            Proveedores homologados para abastecer este producto en los
            almacenes.
          </p>
        </div>

        <PermissionGate permission="catalog:write">
          <form
            onSubmit={handleAttachSubmit}
            className="flex items-center gap-1.5"
          >
            <Select
              aria-label="Seleccionar proveedor para vincular"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="h-8 w-48 text-xs"
              disabled={
                attachMutation.isPending || availableSuppliers.length === 0
              }
            >
              <option value="">
                {availableSuppliers.length === 0
                  ? "Sin proveedores pendientes"
                  : "Selecciona un proveedor..."}
              </option>
              {availableSuppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} ({supplier.code})
                </option>
              ))}
            </Select>
            <Button
              type="submit"
              size="xs"
              disabled={!selectedSupplierId || attachMutation.isPending}
            >
              {attachMutation.isPending ? "Vinculando..." : "Vincular"}
            </Button>
          </form>
        </PermissionGate>
      </CardHeader>

      <CardContent className="p-0">
        {feedbackSuccess ? (
          <div
            role="status"
            className="mx-4 my-2 rounded border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800"
          >
            {feedbackSuccess}
          </div>
        ) : null}

        {feedbackError ? (
          <div
            role="alert"
            className="mx-4 my-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700"
          >
            {feedbackError}
          </div>
        ) : null}

        {isLoading ? (
          <div
            role="status"
            className="p-8 text-center font-mono text-xs text-neutral-500"
          >
            [Cargando proveedores vinculados...]
          </div>
        ) : attachedSuppliers.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No hay proveedores vinculados a este producto todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200/80 bg-neutral-50/60 font-mono text-xs text-neutral-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Código</th>
                  <th className="px-4 py-2 font-medium">Proveedor</th>
                  <th className="px-4 py-2 font-medium">Contacto</th>
                  <th className="px-4 py-2 font-medium">Correo</th>
                  <th className="px-4 py-2 font-medium">Vinculado</th>
                  <th className="px-4 py-2 text-center font-medium">Estado</th>
                  <th className="px-4 py-2 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {attachedSuppliers.map((supplier: ProductSupplierItemDto) => (
                  <tr
                    key={supplier.supplierId}
                    className="hover:bg-neutral-50/50"
                  >
                    <td className="px-4 py-2.5 font-mono font-medium text-neutral-900">
                      {supplier.code}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-neutral-950">
                      {supplier.name}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">
                      {supplier.contactName || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">
                      {supplier.email || "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-500">
                      {new Date(supplier.linkedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge
                        variant={supplier.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {supplier.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <PermissionGate permission="catalog:write">
                        <Button
                          size="xs"
                          variant="destructive"
                          disabled={detachMutation.isPending}
                          onClick={() =>
                            detachMutation.mutate(supplier.supplierId)
                          }
                        >
                          Desvincular
                        </Button>
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
