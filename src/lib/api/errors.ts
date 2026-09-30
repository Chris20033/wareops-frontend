import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import type {
  ApiErrorCode,
  ApiErrorDetails,
  ApiErrorResponseDto,
} from "@/lib/api/types";

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode | string;
  readonly details?: ApiErrorDetails;
  readonly requestId?: string;

  constructor(payload: {
    statusCode: number;
    code: ApiErrorCode | string;
    message: string;
    details?: ApiErrorDetails;
    requestId?: string;
  }) {
    super(payload.message);
    this.name = "ApiClientError";
    this.statusCode = payload.statusCode;
    this.code = payload.code;
    this.details = payload.details;
    this.requestId = payload.requestId;
  }
}

export function isApiErrorResponse(
  value: unknown,
): value is ApiErrorResponseDto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.statusCode === "number" &&
    typeof record.code === "string" &&
    typeof record.message === "string"
  );
}

const FIELD_CODE_TRANSLATIONS: Record<string, string> = {
  INVALID_SLUG:
    "El identificador (slug) sólo permite minúsculas, números y guiones intermedios.",
  INVALID_TIMEZONE: "Selecciona o ingresa una zona horaria IANA válida.",
  INVALID_UUID: "El identificador enviado no tiene un formato UUID válido.",
  REQUIRED_HEADER: "Falta una cabecera obligatoria para procesar la solicitud.",
};

function translateFieldMessage(rawMessage: string): string {
  return FIELD_CODE_TRANSLATIONS[rawMessage] ?? rawMessage;
}

/**
 * Maps field-level API errors (`details.fields` or `details.field`) onto React Hook Form
 * and returns a clean user-facing banner message.
 */
export function applyApiErrorToForm<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  allowedFields?: ReadonlyArray<Path<TFieldValues>>,
): string {
  if (!(error instanceof ApiClientError)) {
    return "Ocurrió un problema de conexión con el servidor. Intenta nuevamente.";
  }

  const canSetField = (fieldName: string): fieldName is Path<TFieldValues> => {
    if (!allowedFields) {
      return true;
    }
    return allowedFields.includes(fieldName as Path<TFieldValues>);
  };

  if (error.details?.fields && typeof error.details.fields === "object") {
    for (const [fieldName, messages] of Object.entries(error.details.fields)) {
      if (
        Array.isArray(messages) &&
        messages.length > 0 &&
        canSetField(fieldName)
      ) {
        setError(fieldName, {
          type: "server",
          message: translateFieldMessage(String(messages[0])),
        });
      }
    }
  }

  if (
    typeof error.details?.field === "string" &&
    canSetField(error.details.field)
  ) {
    setError(error.details.field, {
      type: "server",
      message: error.message,
    });
  }

  return error.message || "No fue posible procesar la solicitud.";
}
