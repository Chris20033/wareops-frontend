"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
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
import { Select } from "@/components/ui/select";
import { registerUser } from "@/features/auth/api";
import {
  registerSchema,
  slugifyOrganizationName,
  type RegisterFormValues,
} from "@/features/auth/schemas";
import { applyApiErrorToForm } from "@/lib/api/errors";

const COMMON_TIMEZONES = [
  "America/Mexico_City",
  "America/Monterrey",
  "America/Tijuana",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "America/New_York",
  "Europe/Madrid",
  "UTC",
] as const;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [orgNamePreview, setOrgNamePreview] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      organizationName: "",
      organizationSlug: "",
      timezone: "America/Mexico_City",
    },
  });

  const suggestedSlug = slugifyOrganizationName(orgNamePreview);

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser(values);
      router.push("/profile");
    } catch (error) {
      const message = applyApiErrorToForm(error, setError, [
        "displayName",
        "email",
        "password",
        "organizationName",
        "organizationSlug",
        "timezone",
      ]);
      setServerError(message);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear cuenta y organización</CardTitle>
        <CardDescription>
          Configura tu usuario inicial y la primera entidad tenant como
          Propietario (OWNER).
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-3.5"
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
            <Label htmlFor="register-displayName">Nombre completo</Label>
            <Input
              id="register-displayName"
              autoComplete="name"
              placeholder="Ana García"
              aria-invalid={Boolean(errors.displayName)}
              aria-describedby={
                errors.displayName ? "register-displayName-error" : undefined
              }
              {...register("displayName")}
            />
            {errors.displayName ? (
              <p
                id="register-displayName-error"
                className="text-xs text-red-600"
              >
                {errors.displayName.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="register-email">Correo electrónico</Label>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="ana@empresa.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "register-email-error" : undefined
                }
                {...register("email")}
              />
              {errors.email ? (
                <p id="register-email-error" className="text-xs text-red-600">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-password">Contraseña</Label>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "register-password-error" : undefined
                }
                {...register("password")}
              />
              {errors.password ? (
                <p
                  id="register-password-error"
                  className="text-xs text-red-600"
                >
                  {errors.password.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="register-organizationName">
              Nombre de la organización
            </Label>
            <Input
              id="register-organizationName"
              placeholder="Distribuidora del Norte"
              aria-invalid={Boolean(errors.organizationName)}
              aria-describedby={
                errors.organizationName
                  ? "register-organizationName-error"
                  : undefined
              }
              {...register("organizationName", {
                onChange: (event: ChangeEvent<HTMLInputElement>) =>
                  setOrgNamePreview(event.target.value),
              })}
            />
            {errors.organizationName ? (
              <p
                id="register-organizationName-error"
                className="text-xs text-red-600"
              >
                {errors.organizationName.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="register-organizationSlug">Slug</Label>
                {suggestedSlug ? (
                  <button
                    type="button"
                    onClick={() =>
                      setValue("organizationSlug", suggestedSlug, {
                        shouldValidate: true,
                      })
                    }
                    className="text-[11px] text-neutral-500 underline hover:text-neutral-950"
                  >
                    Usar sugerido
                  </button>
                ) : null}
              </div>
              <Input
                id="register-organizationSlug"
                placeholder={suggestedSlug || "distribuidora-norte"}
                className="font-mono text-xs"
                aria-invalid={Boolean(errors.organizationSlug)}
                aria-describedby={
                  errors.organizationSlug
                    ? "register-organizationSlug-error"
                    : undefined
                }
                {...register("organizationSlug")}
              />
              {errors.organizationSlug ? (
                <p
                  id="register-organizationSlug-error"
                  className="text-xs text-red-600"
                >
                  {errors.organizationSlug.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-timezone">Zona horaria</Label>
              <Select
                id="register-timezone"
                aria-invalid={Boolean(errors.timezone)}
                aria-describedby={
                  errors.timezone ? "register-timezone-error" : undefined
                }
                {...register("timezone")}
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </Select>
              {errors.timezone ? (
                <p
                  id="register-timezone-error"
                  className="text-xs text-red-600"
                >
                  {errors.timezone.message}
                </p>
              ) : null}
            </div>
          </div>

          <Button
            type="submit"
            size="default"
            disabled={isSubmitting}
            className="mt-2 w-full"
          >
            {isSubmitting
              ? "Creando organización..."
              : "Registrar y entrar al panel"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-xs text-neutral-500">
        <span>¿Ya estás registrado?</span>
        <Link
          href="/login"
          className="font-medium text-neutral-950 underline underline-offset-4 hover:text-neutral-700"
        >
          Iniciar sesión
        </Link>
      </CardFooter>
    </Card>
  );
}
