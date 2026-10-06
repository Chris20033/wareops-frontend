"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
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
import {
  acceptInvitationRequest,
  fetchAuthenticatedProfile,
  loginUser,
} from "@/features/auth/api";
import {
  acceptInvitationNewAccountSchema,
  type AcceptInvitationNewAccountValues,
} from "@/features/auth/schemas";
import { refreshSessionOnce } from "@/lib/api/client";
import { ApiClientError, applyApiErrorToForm } from "@/lib/api/errors";
import type { AcceptedInvitationResultDto } from "@/lib/api/types";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { useOrganizationStore } from "@/stores/organization-store";
import { useSessionStore } from "@/stores/session-store";

export function AcceptInvitationCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token")?.trim() ?? "";

  const sessionStatus = useSessionStore((state) => state.status);
  const currentUser = useSessionStore((state) => state.user);
  const setActiveOrganization = useOrganizationStore(
    (state) => state.setActiveOrganization,
  );

  const [selectedMode, setSelectedMode] = useState<
    "session" | "new-account" | null
  >(null);
  const [manualToken, setManualToken] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [requiresExistingLogin, setRequiresExistingLogin] = useState(false);
  const [isAcceptingSession, setIsAcceptingSession] = useState(false);
  const [acceptedResult, setAcceptedResult] =
    useState<AcceptedInvitationResultDto | null>(null);

  const mode =
    selectedMode ??
    (sessionStatus === "authenticated" && currentUser
      ? "session"
      : "new-account");

  useEffect(() => {
    if (sessionStatus === "idle") {
      void refreshSessionOnce();
    }
  }, [sessionStatus]);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInvitationNewAccountValues>({
    resolver: zodResolver(acceptInvitationNewAccountSchema),
    defaultValues: {
      token: tokenFromQuery,
      displayName: "",
      password: "",
    },
  });

  useEffect(() => {
    if (tokenFromQuery) {
      setValue("token", tokenFromQuery);
    }
  }, [tokenFromQuery, setValue]);

  const effectiveToken = (tokenFromQuery || manualToken).trim();

  const handleAcceptWithCurrentSession = async () => {
    setServerError(null);
    setRequiresExistingLogin(false);

    if (effectiveToken.length < 16) {
      setServerError(
        "El enlace de invitación no contiene un token válido (mínimo 16 caracteres).",
      );
      return;
    }

    setIsAcceptingSession(true);
    try {
      const result = await acceptInvitationRequest({
        token: effectiveToken,
        useCurrentSession: true,
      });
      setAcceptedResult(result);
      await fetchAuthenticatedProfile();
      setActiveOrganization(result.membership.organizationId);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setServerError(error.message);
      } else {
        setServerError("No fue posible aceptar la invitación.");
      }
    } finally {
      setIsAcceptingSession(false);
    }
  };

  const onSubmitNewAccount = async (
    values: AcceptInvitationNewAccountValues,
  ) => {
    setServerError(null);
    setRequiresExistingLogin(false);

    try {
      const result = await acceptInvitationRequest({
        token: values.token,
        displayName: values.displayName,
        password: values.password,
        useCurrentSession: false,
      });

      setAcceptedResult(result);

      try {
        await loginUser({
          email: result.invitation.email,
          password: values.password,
        });
        setActiveOrganization(result.membership.organizationId);
      } catch {
        // User can still sign in manually from /login if needed
      }
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.statusCode === 401 &&
        error.code === "AUTHENTICATION_REQUIRED"
      ) {
        setRequiresExistingLogin(true);
      }

      const message = applyApiErrorToForm(error, setError, [
        "token",
        "displayName",
        "password",
      ]);
      setServerError(message);
    }
  };

  const loginRedirectHref = `/login?next=${encodeURIComponent(
    `/invitations/accept${
      effectiveToken ? `?token=${encodeURIComponent(effectiveToken)}` : ""
    }`,
  )}`;

  if (acceptedResult) {
    const roleLabel =
      ROLE_LABELS[acceptedResult.membership.role.code] ??
      acceptedResult.membership.role.name;

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invitación aceptada</CardTitle>
            <Badge variant="default">{roleLabel}</Badge>
          </div>
          <CardDescription>
            Membresía activa para{" "}
            <strong>{acceptedResult.invitation.email}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700">
            <p className="font-medium text-neutral-900">
              Rol otorgado: {roleLabel} ({acceptedResult.membership.role.code})
            </p>
            <p className="mt-1 font-mono text-[11px] text-neutral-500">
              Tenant ID: {acceptedResult.membership.organizationId}
            </p>
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={() => router.push("/profile")}
          >
            Ir al panel de control
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Aceptar invitación</CardTitle>
        <CardDescription>
          Incorporación a la organización especificada en el enlace.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {currentUser ? (
          <div className="inline-flex w-full rounded border border-neutral-200 bg-neutral-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setSelectedMode("session");
                setServerError(null);
              }}
              className={`flex-1 rounded py-1 transition-colors ${
                mode === "session"
                  ? "bg-white text-neutral-950"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Sesión activa ({currentUser.email})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedMode("new-account");
                setServerError(null);
              }}
              className={`flex-1 rounded py-1 transition-colors ${
                mode === "new-account"
                  ? "bg-white text-neutral-950"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Cuenta nueva
            </button>
          </div>
        ) : null}

        {serverError ? (
          <div
            role="alert"
            className="space-y-1.5 rounded border border-red-200 bg-red-50/70 px-3.5 py-2.5 text-xs text-red-900"
          >
            <p>{serverError}</p>
            {requiresExistingLogin ? (
              <p>
                <Link
                  href={loginRedirectHref}
                  className="font-medium underline underline-offset-4"
                >
                  Iniciar sesión con mi cuenta para aceptar
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        {mode === "session" && currentUser ? (
          <div className="space-y-3.5">
            <div className="border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
              <p>
                Identificado como{" "}
                <strong className="text-neutral-900">
                  {currentUser.displayName}
                </strong>{" "}
                ({currentUser.email}).
              </p>
              <p className="mt-1 text-[11px] text-neutral-500">
                El correo de la cuenta debe coincidir con el destinatario de la
                invitación.
              </p>
            </div>

            {!tokenFromQuery ? (
              <div className="space-y-1.5">
                <Label htmlFor="session-invitation-token">Token</Label>
                <Input
                  id="session-invitation-token"
                  value={manualToken}
                  onChange={(event) => setManualToken(event.target.value)}
                  placeholder="Token de invitación"
                  className="font-mono text-xs"
                />
              </div>
            ) : null}

            <Button
              type="button"
              disabled={isAcceptingSession}
              onClick={handleAcceptWithCurrentSession}
              className="w-full"
            >
              {isAcceptingSession ? "Aceptando..." : "Confirmar con mi cuenta"}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmitNewAccount)}
            noValidate
            className="space-y-3.5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="invite-token">Token</Label>
              <Input
                id="invite-token"
                readOnly={Boolean(tokenFromQuery)}
                placeholder="Token de invitación"
                className="font-mono text-xs"
                aria-invalid={Boolean(errors.token)}
                aria-describedby={
                  errors.token ? "invite-token-error" : undefined
                }
                {...register("token")}
              />
              {errors.token ? (
                <p id="invite-token-error" className="text-xs text-red-600">
                  {errors.token.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-displayName">Nombre completo</Label>
              <Input
                id="invite-displayName"
                autoComplete="name"
                placeholder="Carlos Méndez"
                aria-invalid={Boolean(errors.displayName)}
                aria-describedby={
                  errors.displayName ? "invite-displayName-error" : undefined
                }
                {...register("displayName")}
              />
              {errors.displayName ? (
                <p
                  id="invite-displayName-error"
                  className="text-xs text-red-600"
                >
                  {errors.displayName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-password">Contraseña</Label>
              <Input
                id="invite-password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "invite-password-error" : undefined
                }
                {...register("password")}
              />
              {errors.password ? (
                <p id="invite-password-error" className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full"
            >
              {isSubmitting ? "Activando..." : "Crear cuenta y aceptar"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between text-xs text-neutral-500">
        <span>¿Ya tienes cuenta?</span>
        <Link
          href={loginRedirectHref}
          className="font-medium text-neutral-950 underline underline-offset-4 hover:text-neutral-700"
        >
          Iniciar sesión
        </Link>
      </CardFooter>
    </Card>
  );
}
