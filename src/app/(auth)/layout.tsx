import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200/80 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-950 transition-opacity hover:opacity-80"
          >
            <span>WareOps</span>
            <span className="text-[11px] font-normal text-neutral-500">
              / acceso
            </span>
          </Link>

          <nav
            aria-label="Navegación de acceso"
            className="flex items-center gap-4 text-xs font-medium"
          >
            <Link
              href="/login"
              className="text-neutral-600 transition-colors hover:text-neutral-950"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded bg-neutral-950 px-2.5 py-1 text-white transition-colors hover:bg-neutral-800"
            >
              Crear organización
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        {children}
      </main>
    </div>
  );
}
