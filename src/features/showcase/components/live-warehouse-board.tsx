"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PermissionCode, RoleCode } from "@/lib/api/types";
import { ROLE_LABELS } from "@/lib/auth/permissions";

interface WarehouseSkuItem {
  sku: string;
  name: string;
  binLocation: string;
  unit: string;
  physical: number;
  reserved: number;
  minThreshold: number;
}

interface WarehouseNode {
  code: string;
  name: string;
  branch: string;
  city: string;
  items: ReadonlyArray<WarehouseSkuItem>;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  warehouseCode: string;
  sku: string;
  operation: "ENTRADA_RECEPCION" | "RESERVA_ORDEN";
  deltaLabel: string;
  roleCode: RoleCode;
  idempotencyKey: string;
  resultingAvailable: number;
}

const INITIAL_WAREHOUSES: ReadonlyArray<WarehouseNode> = [
  {
    code: "MTY-N01",
    name: "Hub Logístico Apodaca",
    branch: "Sucursal Noreste",
    city: "Monterrey, NL",
    items: [
      {
        sku: "SKU-VAL-4020",
        name: "Válvula solenoide neumática 3/2 vías G1/4",
        binLocation: "P01-R04-N02",
        unit: "pza",
        physical: 420,
        reserved: 65,
        minThreshold: 120,
      },
      {
        sku: "SKU-ROD-1180",
        name: "Rodamiento axial de carga pesada serie 512",
        binLocation: "P01-R08-N01",
        unit: "pza",
        physical: 185,
        reserved: 150,
        minThreshold: 40,
      },
      {
        sku: "SKU-SEN-0940",
        name: "Sensor fotoeléctrico réflex polarizado IP67",
        binLocation: "P02-R02-N04",
        unit: "pza",
        physical: 310,
        reserved: 45,
        minThreshold: 80,
      },
      {
        sku: "SKU-ACT-3310",
        name: "Cilindro compacto doble efecto ISO 21287",
        binLocation: "P03-R01-N02",
        unit: "pza",
        physical: 95,
        reserved: 20,
        minThreshold: 60,
      },
    ],
  },
  {
    code: "GDL-C02",
    name: "Centro Distribución El Salto",
    branch: "Sucursal Occidente",
    city: "Guadalajara, JAL",
    items: [
      {
        sku: "SKU-VAL-4020",
        name: "Válvula solenoide neumática 3/2 vías G1/4",
        binLocation: "A02-R01-N03",
        unit: "pza",
        physical: 260,
        reserved: 40,
        minThreshold: 100,
      },
      {
        sku: "SKU-CAB-7700",
        name: "Arnés blindado M12 8 pines apantallado 5m",
        binLocation: "A04-R03-N01",
        unit: "pza",
        physical: 540,
        reserved: 110,
        minThreshold: 150,
      },
      {
        sku: "SKU-REG-2205",
        name: "Unidad mantenimiento FRL filtro-regulador 1/2",
        binLocation: "B01-R06-N02",
        unit: "pza",
        physical: 88,
        reserved: 70,
        minThreshold: 25,
      },
    ],
  },
  {
    code: "CDMX-S01",
    name: "Terminal Vallejo Pantaco",
    branch: "Sucursal Centro",
    city: "Azcapotzalco, CDMX",
    items: [
      {
        sku: "SKU-SEN-0940",
        name: "Sensor fotoeléctrico réflex polarizado IP67",
        binLocation: "C01-R02-N01",
        unit: "pza",
        physical: 190,
        reserved: 30,
        minThreshold: 60,
      },
      {
        sku: "SKU-ACT-3310",
        name: "Cilindro compacto doble efecto ISO 21287",
        binLocation: "C02-R05-N03",
        unit: "pza",
        physical: 140,
        reserved: 95,
        minThreshold: 50,
      },
      {
        sku: "SKU-PLC-9010",
        name: "Módulo expansión E/S digitales 16 canales 24V",
        binLocation: "D01-R01-N04",
        unit: "pza",
        physical: 64,
        reserved: 12,
        minThreshold: 20,
      },
    ],
  },
];

const SIMULATED_ROLES: ReadonlyArray<{
  code: RoleCode;
  permissions: ReadonlyArray<PermissionCode>;
}> = [
  {
    code: "OWNER",
    permissions: [
      "organization:manage",
      "member:manage",
      "inventory:read",
      "inventory:write",
      "order:write",
      "audit:read",
    ],
  },
  {
    code: "MANAGER",
    permissions: [
      "inventory:read",
      "inventory:write",
      "order:write",
      "audit:read",
    ],
  },
  {
    code: "OPERATOR",
    permissions: ["inventory:read", "inventory:write", "order:write"],
  },
  {
    code: "VIEWER",
    permissions: ["inventory:read"],
  },
];

export function LiveWarehouseBoard() {
  const [warehouses, setWarehouses] =
    useState<ReadonlyArray<WarehouseNode>>(INITIAL_WAREHOUSES);
  const [selectedWarehouseCode, setSelectedWarehouseCode] =
    useState<string>("MTY-N01");
  const [activeRoleCode, setActiveRoleCode] = useState<RoleCode>("MANAGER");
  const [highlightedSku, setHighlightedSku] = useState<string | null>(null);
  const [sequenceCount, setSequenceCount] = useState<number>(104);
  const [auditLog, setAuditLog] = useState<AuditEntry>({
    id: "evt_0104",
    timestamp: "14:22:08 UTC",
    warehouseCode: "MTY-N01",
    sku: "SKU-ROD-1180",
    operation: "RESERVA_ORDEN",
    deltaLabel: "Reservado +15 pza (Orden #ORD-8841)",
    roleCode: "MANAGER",
    idempotencyKey: "idem_9f82a4c1",
    resultingAvailable: 35,
  });

  const currentWarehouse =
    warehouses.find((w) => w.code === selectedWarehouseCode) ?? warehouses[0];
  const currentRole =
    SIMULATED_ROLES.find((r) => r.code === activeRoleCode) ??
    SIMULATED_ROLES[1];

  const canMutateInventory =
    currentRole.permissions.includes("inventory:write") ||
    currentRole.permissions.includes("order:write");
  const canReadAudit = currentRole.permissions.includes("audit:read");

  const totalPhysical = currentWarehouse.items.reduce(
    (acc, item) => acc + item.physical,
    0,
  );
  const totalReserved = currentWarehouse.items.reduce(
    (acc, item) => acc + item.reserved,
    0,
  );
  const totalAvailable = totalPhysical - totalReserved;

  const handleMutateStock = (
    sku: string,
    mode: "ENTRADA_RECEPCION" | "RESERVA_ORDEN",
  ) => {
    if (!canMutateInventory) {
      return;
    }

    const nextSeq = sequenceCount + 1;
    let updatedAvailable = 0;
    let didUpdate = false;

    setWarehouses((prev) =>
      prev.map((warehouse) => {
        if (warehouse.code !== currentWarehouse.code) {
          return warehouse;
        }
        return {
          ...warehouse,
          items: warehouse.items.map((item) => {
            if (item.sku !== sku) {
              return item;
            }
            const available = item.physical - item.reserved;
            if (mode === "RESERVA_ORDEN") {
              if (available < 5) {
                return item;
              }
              didUpdate = true;
              const nextReserved = item.reserved + 5;
              updatedAvailable = item.physical - nextReserved;
              return {
                ...item,
                reserved: nextReserved,
              };
            }

            didUpdate = true;
            const nextPhysical = item.physical + 10;
            updatedAvailable = nextPhysical - item.reserved;
            return {
              ...item,
              physical: nextPhysical,
            };
          }),
        };
      }),
    );

    if (!didUpdate) {
      return;
    }

    setSequenceCount(nextSeq);
    setHighlightedSku(sku);
    setAuditLog({
      id: `evt_0${nextSeq}`,
      timestamp: "Ahora mismo",
      warehouseCode: currentWarehouse.code,
      sku,
      operation: mode,
      deltaLabel:
        mode === "ENTRADA_RECEPCION"
          ? "Entrada física +10 pza (Disponible +10)"
          : "Reserva atómica +5 pza (Disponible -5)",
      roleCode: activeRoleCode,
      idempotencyKey: `idem_${nextSeq}b7e2`,
      resultingAvailable: updatedAvailable,
    });
  };

  const handleResetSimulation = () => {
    setWarehouses(INITIAL_WAREHOUSES);
    setHighlightedSku(null);
    setSequenceCount(104);
  };

  return (
    <div
      role="region"
      aria-label="Tablero interactivo de inventario multi-almacén"
      className="overflow-hidden rounded-lg border border-neutral-900 bg-white text-neutral-950"
    >
      {/* Segmented Manifest Pass Header */}
      <div className="grid border-b border-neutral-900 bg-neutral-950 text-neutral-100 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-b border-neutral-800 px-4 py-3 sm:border-r lg:border-b-0">
          <div className="text-[11px] font-medium text-neutral-400">
            Contexto de organización
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-white">
              Grupo Industrial del Norte
            </span>
            <code className="rounded border border-neutral-700 bg-neutral-900 px-1.5 py-0.5 font-mono text-[11px] text-neutral-300">
              org_norte_01
            </code>
          </div>
        </div>

        <div className="border-b border-neutral-800 px-4 py-3 lg:border-r lg:border-b-0">
          <div className="text-[11px] font-medium text-neutral-400">
            Almacén operativo activo
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-white">
              {currentWarehouse.name}
            </span>
            <span className="font-mono text-[11px] text-neutral-300">
              {currentWarehouse.code}
            </span>
          </div>
        </div>

        <div className="border-b border-neutral-800 px-4 py-3 sm:border-r sm:border-b-0">
          <div className="text-[11px] font-medium text-neutral-400">
            Autorización RBAC activa
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-white">
              {ROLE_LABELS[activeRoleCode]}
            </span>
            <code className="font-mono text-[11px] text-neutral-300">
              {canMutateInventory ? "inventory:write" : "inventory:read"}
            </code>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="text-[11px] font-medium text-neutral-400">
            Invariante contable (Físico = Res. + Disp.)
          </div>
          <div className="mt-1 font-mono text-xs font-semibold text-white">
            {totalPhysical} = {totalReserved} + {totalAvailable} uds
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="flex flex-col justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-neutral-600">
            Ubicación:
          </span>
          {warehouses.map((warehouse) => {
            const isSelected = warehouse.code === currentWarehouse.code;
            return (
              <button
                key={warehouse.code}
                type="button"
                onClick={() => {
                  setSelectedWarehouseCode(warehouse.code);
                  setHighlightedSku(null);
                }}
                className={`inline-flex h-7 items-center gap-1.5 rounded border px-2.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-950"
                }`}
              >
                <span className="font-mono text-[11px]">{warehouse.code}</span>
                <span className="hidden sm:inline">· {warehouse.city}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-neutral-600">
            Simular rol:
          </span>
          {SIMULATED_ROLES.map((role) => {
            const isSelected = role.code === activeRoleCode;
            return (
              <button
                key={role.code}
                type="button"
                onClick={() => setActiveRoleCode(role.code)}
                className={`inline-flex h-7 items-center rounded border px-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-neutral-950 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-950"
                }`}
              >
                {ROLE_LABELS[role.code]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Inventory Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-white text-[11px] font-semibold tracking-wider text-neutral-600 uppercase">
              <th className="py-2.5 pr-3 pl-4">SKU / Descripción</th>
              <th className="px-3 py-2.5">Ubicación</th>
              <th className="px-3 py-2.5 text-right">Físico</th>
              <th className="px-3 py-2.5 text-right">Reservado</th>
              <th className="px-3 py-2.5 text-right">Disponible</th>
              <th className="px-3 py-2.5">Estado</th>
              <th className="py-2.5 pr-4 pl-3 text-right">
                Operación transaccional
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/80">
            {currentWarehouse.items.map((item) => {
              const available = item.physical - item.reserved;
              const isLowStock = available <= item.minThreshold;
              const isRecentlyMutated = highlightedSku === item.sku;

              return (
                <tr
                  key={item.sku}
                  className={`transition-colors ${
                    isRecentlyMutated
                      ? "bg-amber-50/90"
                      : "bg-white hover:bg-neutral-50/80"
                  }`}
                >
                  <td className="py-3 pr-3 pl-4">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs font-semibold text-neutral-950">
                        {item.sku}
                      </code>
                      {isRecentlyMutated ? (
                        <Badge variant="default" className="text-[10px]">
                          Actualizado
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-600">
                      {item.name}
                    </div>
                  </td>

                  <td className="px-3 py-3 font-mono text-xs text-neutral-700">
                    {item.binLocation}
                  </td>

                  <td className="px-3 py-3 text-right font-mono text-xs font-medium text-neutral-900">
                    {item.physical}
                  </td>

                  <td className="px-3 py-3 text-right font-mono text-xs text-neutral-600">
                    {item.reserved}
                  </td>

                  <td className="px-3 py-3 text-right font-mono text-xs font-semibold text-neutral-950">
                    {available}
                  </td>

                  <td className="px-3 py-3">
                    {isLowStock ? (
                      <Badge
                        variant="outline"
                        className="border-amber-400 bg-amber-50 text-amber-900"
                      >
                        Bajo mínimo ({item.minThreshold})
                      </Badge>
                    ) : (
                      <Badge variant="outline">Óptimo</Badge>
                    )}
                  </td>

                  <td className="py-3 pr-4 pl-3 text-right">
                    {canMutateInventory ? (
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          disabled={available < 5}
                          onClick={() =>
                            handleMutateStock(item.sku, "RESERVA_ORDEN")
                          }
                        >
                          Reservar 5
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="secondary"
                          onClick={() =>
                            handleMutateStock(item.sku, "ENTRADA_RECEPCION")
                          }
                        >
                          +10 Entrada
                        </Button>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-neutral-500">
                        Bloqueado ({activeRoleCode})
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Live Audit & Invariant Footer */}
      <div className="flex flex-col justify-between gap-2 border-t border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 text-neutral-700">
          <span className="font-semibold text-neutral-950">
            Registro de auditoría:
          </span>
          {canReadAudit ? (
            <>
              <code className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 font-mono text-[11px] text-neutral-800">
                {auditLog.id}
              </code>
              <span className="font-mono text-[11px] text-neutral-700">
                [{auditLog.warehouseCode}] {auditLog.sku}
              </span>
              <span>— {auditLog.deltaLabel}</span>
              <span className="font-mono text-[11px] text-neutral-500">
                ({auditLog.idempotencyKey})
              </span>
            </>
          ) : (
            <span className="text-neutral-600">
              El rol <strong>{ROLE_LABELS[activeRoleCode]}</strong> no posee el
              permiso <code className="font-mono">audit:read</code> para
              inspeccionar la bitácora detallada.
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-neutral-500">
            Demostración operativa sintética
          </span>
          {sequenceCount > 104 ? (
            <button
              type="button"
              onClick={handleResetSimulation}
              className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
            >
              Restablecer
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
