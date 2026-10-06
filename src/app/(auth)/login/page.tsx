"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? undefined;
  const email = searchParams.get("email") ?? "";

  return <LoginForm nextPath={nextPath} defaultEmail={email} />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          Cargando formulario de inicio de sesión...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
