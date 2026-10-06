"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { PermissionGate } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/features/auth/api";
import { OrganizationSwitcher } from "@/features/organizations/components/organization-switcher";
import { refreshSessionOnce, setUnauthorizedHandler } from "@/lib/api/client";
import { useSessionStore } from "@/stores/session-store";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const status = useSessionStore((state) => state.status);
  const user = useSessionStore((state) => state.user);
  const setStatus = useSessionStore((state) => state.setStatus);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      router.replace("/login");
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [queryClient, router]);

  useEffect(() => {
    if (status === "idle") {
      setStatus("initializing");
      void refreshSessionOnce({ notifyOnFailure: true }).then((session) => {
        if (!session) {
          router.replace("/login");
        }
      });
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, setStatus, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      queryClient.clear();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (status === "idle" || status === "initializing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-neutral-600">
        <div
          role="status"
          aria-live="polite"
          className="border border-neutral-200 bg-neutral-50 px-5 py-3 font-mono text-xs"
        >
          [Cargando sesión segura...]
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50/60 text-neutral-900">
      <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/profile"
              className="text-sm font-semibold tracking-tight text-neutral-950"
            >
              WareOps
            </Link>

            <nav
              aria-label="Navegación principal"
              className="flex items-center gap-1 text-xs"
            >
              <Link
                href="/profile"
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  pathname === "/profile"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
              >
                Mi perfil
              </Link>

              <PermissionGate permission="member:manage">
                <Link
                  href="/members"
                  className={`rounded px-2.5 py-1 font-medium transition-colors ${
                    pathname?.startsWith("/members")
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                  }`}
                >
                  Miembros e invitaciones
                </Link>
              </PermissionGate>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <OrganizationSwitcher />

            {user ? (
              <span className="hidden text-xs text-neutral-500 lg:inline">
                {user.displayName}
              </span>
            ) : null}

            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
