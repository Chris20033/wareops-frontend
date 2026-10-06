# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Responsables de inventario y operaciones (`MANAGER`, `ADMIN`, `OWNER`)**: Dirigen almacenes y sucursales múltiples, supervisan niveles de stock físico, reservado y disponible, auditan discrepancias y configuran permisos por organización.
- **Personal operativo de almacén (`OPERATOR`)**: Registra entradas, salidas, ajustes, reservas de órdenes y transferencias entre almacenes en tiempo real.
- **Supervisores y auditores (`VIEWER`, `MANAGER`)**: Consultan trazabilidad completa de movimientos, alertas de stock mínimo e historial inmutable de auditoría.

## Product Purpose

WareOps centraliza la operación de sucursales, almacenes, catálogo de productos/SKU, proveedores, órdenes de salida, transferencias y auditoría en una plataforma multi-tenant. Elimina la fragmentación de hojas de cálculo y sistemas aislados, garantizando que cada unidad física, reservada y disponible esté contabilizada de forma exacta y verificable.

## Positioning

Control de inventario multi-almacén con consistencia transaccional estricta: impide existencias negativas ante operaciones concurrentes, ejecuta transferencias atómicas entre almacenes sin estados parciales, garantiza idempotencia en mutaciones críticas y aísla cada organización mediante membresías con control de acceso basado en roles (RBAC).

## Operating Context

- Operaciones diarias de recepción, surtido de órdenes, conteo cíclico y traslado inter-almacén.
- Trabajo en escritorio y terminales operativas dentro de almacenes y oficinas logísticas bajo condiciones de lectura rápida de códigos SKU, ubicaciones, lotes y cantidades tabulares.
- Cambio fluido entre múltiples organizaciones (`X-Organization-Id`) para operadores logísticos o grupos empresariales con varias razones sociales.

## Capabilities and Constraints

- **Módulos del sistema**: Identidad y acceso (JWT + rotación de refresh tokens Argon2id), Organizaciones multi-tenant, Ubicaciones (sucursales y almacenes), Catálogo (productos, SKU, proveedores), Inventario (físico, reservado, disponible), Transferencias atómicas, Órdenes y reservas, Auditoría inmutable y Dashboard de supervisión.
- **Roles predefinidos**: `OWNER`, `ADMIN`, `MANAGER`, `OPERATOR`, `VIEWER` con matriz de permisos normalizada.
- **Idioma**: Español en toda la interfaz de usuario, mensajes de validación y documentación operativa.

## Brand Commitments

- **Cero degradados de color**: Prohibición absoluta de gradientes lineales, radiales, textos con degradado o halos de color difusos.
- **Estética minimalista, moderna e industrial**: Superficies sólidas de alto contraste, bordes arquitectónicos de 1px, jerarquía tipográfica rigurosa, datos tabulares en fuente monoespaciada para códigos SKU/tokens/métricas, y ausencia total de clichés visuales generados por IA (_AI slop_).

## Evidence on Hand

- Documentación arquitectónica y de dominio completa en `wareops-docs` (`01 Producto` a `09 ADR`).
- Contratos reales de API y modelos en `wareops-api` y `wareops-web/src/lib/api/types.ts`.
- Los datos mostrados en simuladores interactivos de la página principal deben etiquetarse honestamente como demostración operativa sintética.

## Product Principles

1. **Exactitud contable antes que adorno**: Cada pantalla prioriza la lectura inequívoca de existencias (`Físico = Reservado + Disponible`), estados y responsables.
2. **Aislamiento y autoridad explícita**: El usuario siempre sabe en qué organización opera, bajo qué rol y qué acciones le están permitidas.
3. **Integridad transaccional visible**: Las operaciones críticas comunican su estado atómico, idempotencia y trazabilidad sin ambigüedades.
4. **Sobriedad industrial**: Diseño funcional, directo y silencioso que respeta la atención del operador logístico.
