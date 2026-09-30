import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { Providers } from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "WareOps — Control Operativo de Inventario y Almacenes Multi-tenant",
  description:
    "Plataforma de operaciones de almacén con consistencia transaccional de existencias, transferencias atómicas e identidad multi-tenant con RBAC.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
