import type { PermissionCode, RoleCode } from "@/lib/api/types";

export const ROLE_LABELS: Record<RoleCode, string> = {
  OWNER: "Propietario",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  OPERATOR: "Operador",
  VIEWER: "Lector",
};

export const ROLE_DESCRIPTIONS: Record<RoleCode, string> = {
  OWNER: "Control total de la organización, miembros, catálogo e inventario.",
  ADMIN: "Administración de miembros, invitaciones, catálogo y operaciones.",
  MANAGER: "Gestión de catálogo, inventario, órdenes y consulta de auditoría.",
  OPERATOR: "Ejecución operativa de movimientos de inventario y órdenes.",
  VIEWER: "Consulta de solo lectura en tablero, catálogo e inventario.",
};

export const INVITABLE_ROLES: ReadonlyArray<Exclude<RoleCode, "OWNER">> = [
  "ADMIN",
  "MANAGER",
  "OPERATOR",
  "VIEWER",
];

export const ALL_ROLES: ReadonlyArray<RoleCode> = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "OPERATOR",
  "VIEWER",
];

export const PERMISSION_LABELS: Record<PermissionCode, string> = {
  "organization:manage": "Configurar organización",
  "member:manage": "Administrar miembros e invitaciones",
  "catalog:read": "Consultar sucursales, almacenes y catálogo",
  "catalog:write": "Editar sucursales, almacenes y catálogo",
  "inventory:read": "Consultar existencias y movimientos",
  "inventory:write": "Registrar entradas, salidas, ajustes y transferencias",
  "order:write": "Crear y gestionar órdenes de salida",
  "audit:read": "Consultar bitácora de auditoría",
  "dashboard:read": "Visualizar indicadores del tablero",
};
