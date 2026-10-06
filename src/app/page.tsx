import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LiveWarehouseBoard } from "@/features/showcase/components/live-warehouse-board";

const operationalModules = [
  {
    domain: "Identidad y Organizaciones",
    code: "auth · organizations · members",
    responsibility:
      "Registro transaccional de organización inicial, sesiones rotatorias Argon2id, invitaciones de un solo uso y aislamiento por cabecera X-Organization-Id.",
    guarantee: "Separación estricta entre tenants",
    status: "Activo · Sprint 01",
    isReady: true,
  },
  {
    domain: "Ubicaciones y Catálogo Maestro",
    code: "branches · warehouses · catalog",
    responsibility:
      "Jerarquía de sucursales y almacenes físicos, registro de productos por código SKU único, unidades de medida y vínculo con proveedores.",
    guarantee: "Unicidad de SKU por organización",
    status: "Sprint 02",
    isReady: false,
  },
  {
    domain: "Núcleo de Inventario",
    code: "inventory · stock-movements",
    responsibility:
      "Contabilidad separada de unidades físicas, reservadas y disponibles por almacén; entradas, salidas y ajustes con motivo obligatorio.",
    guarantee: "Bloqueo de inventario negativo",
    status: "Sprint 03",
    isReady: false,
  },
  {
    domain: "Transferencias Inter-almacén",
    code: "transfers · idempotency",
    responsibility:
      "Traslado de mercancía entre almacenes de la misma organización con descuento en origen e incremento en destino dentro de una sola transacción.",
    guarantee: "Cero estados parciales",
    status: "Sprint 04",
    isReady: false,
  },
  {
    domain: "Órdenes de Salida y Reservas",
    code: "orders · reservations",
    responsibility:
      "Borradores de orden, apartado de existencias disponibles sin descontar físico hasta el surtido definitivo, o liberación íntegra al cancelar.",
    guarantee: "Control de concurrencia",
    status: "Sprint 05",
    isReady: false,
  },
  {
    domain: "Auditoría y Supervisión",
    code: "audit · dashboard · alerts",
    responsibility:
      "Bitácora inmutable de actores, entidades y cambios de estado, junto con indicadores de rotación y alertas de reabastecimiento bajo mínimo.",
    guarantee: "Trazabilidad verificable",
    status: "Sprint 06",
    isReady: false,
  },
] as const;

const rbacMatrix = [
  {
    role: "Propietario",
    code: "OWNER",
    org: "Sí",
    members: "Sí",
    catalog: "Sí",
    inventory: "Sí",
    orders: "Sí",
    audit: "Sí",
  },
  {
    role: "Administrador",
    code: "ADMIN",
    org: "—",
    members: "Sí",
    catalog: "Sí",
    inventory: "Sí",
    orders: "Sí",
    audit: "Sí",
  },
  {
    role: "Gerente",
    code: "MANAGER",
    org: "—",
    members: "—",
    catalog: "Sí",
    inventory: "Sí",
    orders: "Sí",
    audit: "Sí",
  },
  {
    role: "Operador",
    code: "OPERATOR",
    org: "—",
    members: "—",
    catalog: "Lectura",
    inventory: "Sí",
    orders: "Sí",
    audit: "—",
  },
  {
    role: "Lector",
    code: "VIEWER",
    org: "—",
    members: "—",
    catalog: "Lectura",
    inventory: "Lectura",
    orders: "—",
    audit: "—",
  },
] as const;

const foundation = [
  ["Aplicación", "Next.js 16 · App Router"],
  ["Interfaz", "Tailwind CSS · shadcn/ui"],
  ["Estado remoto", "TanStack Query"],
  ["Estado cliente", "Zustand"],
  ["Seguridad", "JWT en memoria · Refresh rotatorio"],
] as const;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-950">
      {/* Structural Top Navigation */}
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight text-neutral-950">
              WareOps
            </span>
            <span className="text-neutral-300" aria-hidden="true">
              /
            </span>
            <span className="hidden text-xs text-neutral-600 sm:inline">
              Operaciones de Almacén e Inventario Multi-tenant
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="gap-1.5 text-[11px]">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-emerald-600"
              />
              Frontend activo
            </Badge>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Crear organización
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-14 px-4 py-8 sm:px-6 sm:py-12">
        {/* First Viewport: Operational Thesis + Live Interactive Warehouse Ledger */}
        <section aria-labelledby="foundation-title" className="space-y-8">
          <div className="grid gap-8 border-b border-neutral-200 pb-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <h1
                id="foundation-title"
                className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-balance text-neutral-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
              >
                Control exacto de inventario y operaciones entre múltiples
                almacenes.
              </h1>

              <p className="mt-4 max-w-[64ch] text-base leading-relaxed text-neutral-600">
                WareOps centraliza sucursales, almacenes, catálogo SKU, órdenes
                de salida y transferencias en un libro mayor auditable. Impide
                existencias negativas ante operaciones concurrentes y aísla cada
                organización mediante membresías y permisos por rol.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Crear cuenta y organización
                </Link>
                <Link
                  href="/profile"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                  })}
                >
                  Ir a mi perfil
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-neutral-950">
                Garantías operativas del sistema
              </h2>
              <dl className="mt-3 divide-y divide-neutral-200/80 text-xs">
                <div className="flex items-baseline justify-between gap-4 py-2">
                  <dt className="text-neutral-600">Ecuación de stock</dt>
                  <dd className="font-mono font-medium text-neutral-950">
                    Físico = Reservado + Disponible
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2">
                  <dt className="text-neutral-600">Aislamiento tenant</dt>
                  <dd className="font-mono font-medium text-neutral-950">
                    X-Organization-Id
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2">
                  <dt className="text-neutral-600">Mutaciones críticas</dt>
                  <dd className="font-mono font-medium text-neutral-950">
                    Idempotency-Key + Auditoría
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Interactive Warehouse Ledger Simulator */}
          <LiveWarehouseBoard />
        </section>

        {/* Second Section: End-to-End Operational Module Ledger */}
        <section aria-labelledby="modules-heading" className="space-y-4 pt-2">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2
                id="modules-heading"
                className="text-xl font-semibold tracking-[-0.02em] text-neutral-950 sm:text-2xl"
              >
                Módulos operativos y trazabilidad funcional
              </h2>
              <p className="mt-1 max-w-[68ch] text-sm text-neutral-600">
                Las ubicaciones y el catálogo alimentan al inventario; el
                inventario sustenta transferencias y órdenes mientras auditoría
                e identidad resguardan cada transacción.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold tracking-wider text-neutral-600 uppercase">
                  <th className="py-3 pr-4 pl-4">Dominio</th>
                  <th className="px-4 py-3">Capacidad operativa</th>
                  <th className="px-4 py-3">Regla de integridad</th>
                  <th className="py-3 pr-4 pl-4 text-right">Disponibilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                {operationalModules.map((mod) => (
                  <tr
                    key={mod.domain}
                    className="transition-colors hover:bg-neutral-50/70"
                  >
                    <td className="py-3.5 pr-4 pl-4 align-top">
                      <div className="font-semibold text-neutral-950">
                        {mod.domain}
                      </div>
                      <code className="mt-0.5 block font-mono text-[11px] text-neutral-500">
                        {mod.code}
                      </code>
                    </td>
                    <td className="max-w-md px-4 py-3.5 align-top leading-relaxed text-neutral-600">
                      {mod.responsibility}
                    </td>
                    <td className="px-4 py-3.5 align-top font-mono text-xs text-neutral-800">
                      {mod.guarantee}
                    </td>
                    <td className="py-3.5 pr-4 pl-4 text-right align-top">
                      <Badge
                        variant={mod.isReady ? "default" : "outline"}
                        className="font-mono text-[11px]"
                      >
                        {mod.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Third Section: RBAC Matrix & Technical Foundation */}
        <section
          aria-labelledby="rbac-heading"
          className="grid gap-6 pt-2 lg:grid-cols-[1.3fr_0.7fr]"
        >
          <div className="flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-5 sm:p-6">
            <div>
              <h2
                id="rbac-heading"
                className="text-lg font-semibold tracking-[-0.015em] text-neutral-950 sm:text-xl"
              >
                Control de acceso basado en roles por membresía
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                El rol pertenece a la membresía dentro de cada organización, no
                al usuario global. Un mismo operador puede administrar un tenant
                y auditar otro con permisos de sólo lectura.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-[11px] font-semibold tracking-wider text-neutral-600 uppercase">
                      <th className="py-2 pr-3">Rol</th>
                      <th className="px-2 py-2 text-center">Tenant</th>
                      <th className="px-2 py-2 text-center">Miembros</th>
                      <th className="px-2 py-2 text-center">Catálogo</th>
                      <th className="px-2 py-2 text-center">Inventario</th>
                      <th className="px-2 py-2 text-center">Órdenes</th>
                      <th className="py-2 pl-2 text-center">Auditoría</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/70">
                    {rbacMatrix.map((row) => (
                      <tr key={row.code}>
                        <td className="py-2.5 pr-3">
                          <span className="font-medium text-neutral-950">
                            {row.role}
                          </span>{" "}
                          <code className="font-mono text-[11px] text-neutral-500">
                            {row.code}
                          </code>
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-neutral-700">
                          {row.org}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-neutral-700">
                          {row.members}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-neutral-700">
                          {row.catalog}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-neutral-700">
                          {row.inventory}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-neutral-700">
                          {row.orders}
                        </td>
                        <td className="py-2.5 pl-2 text-center font-mono text-neutral-700">
                          {row.audit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/80 pt-4 text-xs text-neutral-600">
              <span>
                ¿Recibiste un enlace de invitación para unirte a un almacén?
              </span>
              <Link
                href="/invitations/accept"
                className="font-medium text-neutral-950 underline underline-offset-4 hover:text-neutral-700"
              >
                Aceptar invitación con token
              </Link>
            </div>
          </div>

          <aside
            aria-label="Base técnica disponible"
            className="flex flex-col justify-between rounded-lg border border-neutral-900 bg-neutral-950 p-5 text-neutral-100 sm:p-6"
          >
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.015em] text-white sm:text-xl">
                Base técnica
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                Arquitectura cliente verificada y conectada con contratos
                tipados a la API modular.
              </p>

              <Separator className="my-5 bg-neutral-800" />

              <dl className="divide-y divide-neutral-800">
                {foundation.map(([term, detail]) => (
                  <div
                    key={term}
                    className="grid grid-cols-[7.5rem_1fr] items-baseline py-2.5 text-xs"
                  >
                    <dt className="text-neutral-300">{term}</dt>
                    <dd className="font-mono font-medium text-white">
                      {detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 border-t border-neutral-800 pt-4 text-xs text-neutral-300">
              La fundación de WareOps está lista para operar flujos de
              identidad, organizaciones y membresías.
            </div>
          </aside>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-neutral-600 sm:flex-row sm:px-6">
          <span>
            WareOps WMS · Control de Inventario y Operaciones Multi-tenant
          </span>
          <nav aria-label="Enlaces del pie de página" className="flex gap-4">
            <Link href="/login" className="hover:text-neutral-950">
              Iniciar sesión
            </Link>
            <Link href="/register" className="hover:text-neutral-950">
              Registro
            </Link>
            <Link href="/profile" className="hover:text-neutral-950">
              Perfil
            </Link>
            <Link href="/members" className="hover:text-neutral-950">
              Miembros
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
