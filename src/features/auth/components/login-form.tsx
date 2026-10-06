"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/features/auth/api";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { applyApiErrorToForm } from "@/lib/api/errors";

interface LoginFormProps {
  nextPath?: string;
  defaultEmail?: string;
}

export function LoginForm({ nextPath, defaultEmail = "" }: LoginFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await loginUser(values);
      const destination =
        nextPath && nextPath.startsWith("/") ? nextPath : "/profile";
      router.push(destination);
    } catch (error) {
      const message = applyApiErrorToForm(error, setError, [
        "email",
        "password",
      ]);
      setServerError(message);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>
          Credenciales para ingresar a tus almacenes y operaciones.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          {serverError ? (
            <div
              role="alert"
              className="rounded border border-red-200 bg-red-50/70 px-3.5 py-2.5 text-xs text-red-900"
            >
              {serverError}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="login-email">Correo electrónico</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="nombre@empresa.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              {...register("email")}
            />
            {errors.email ? (
              <p id="login-email-error" className="text-xs text-red-600">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password">Contraseña</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
              {...register("password")}
            />
            {errors.password ? (
              <p id="login-password-error" className="text-xs text-red-600">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="default"
            disabled={isSubmitting}
            className="mt-2 w-full"
          >
            {isSubmitting ? "Accediendo..." : "Entrar a WareOps"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-xs text-neutral-500">
        <span>¿Cuenta nueva?</span>
        <Link
          href="/register"
          className="font-medium text-neutral-950 underline underline-offset-4 hover:text-neutral-700"
        >
          Crear organización
        </Link>
      </CardFooter>
    </Card>
  );
}
