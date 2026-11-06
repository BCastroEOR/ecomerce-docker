import "server-only";
import type { FieldErrors } from "./types";

const BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:8000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: FieldErrors = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequest = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

/**
 * Cliente HTTP de la API de Laravel. Solo se ejecuta en el servidor, así el
 * token JWT nunca llega al navegador.
 */
export async function api<T>(path: string, { method = "GET", body, token, headers }: ApiRequest = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    console.error(`[api] No se pudo conectar con ${BASE_URL}${path}`, error);
    throw new ApiError(503, "No pudimos conectarnos con la tienda en este momento. Inténtalo de nuevo en unos minutos.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const fieldErrors: FieldErrors = payload?.errors && !Array.isArray(payload.errors) ? payload.errors : {};
    // El detalle técnico queda en el log del servidor; al usuario solo se le muestra un mensaje comprensible.
    console.error(`[api] ${method} ${path} -> ${response.status}`, payload?.message);
    throw new ApiError(response.status, userMessage(response.status, payload?.message, fieldErrors), fieldErrors);
  }

  return payload as T;
}

/**
 * Traduce la respuesta de la API a un mensaje para el usuario. Se conservan los
 * mensajes propios de la API (ya redactados en español, p. ej. "Credenciales
 * inválidas.") y se reemplazan los genéricos del framework.
 */
function userMessage(status: number, apiMessage: string | undefined, fieldErrors: FieldErrors) {
  if (status >= 500) return "Tuvimos un problema al procesar tu solicitud. Inténtalo de nuevo en unos minutos.";
  if (status === 429) return "Hiciste demasiados intentos. Espera un momento y vuelve a intentarlo.";
  if (status === 403) return "No tienes permiso para realizar esta acción.";
  if (status === 401 && apiMessage === "Unauthenticated.") return "Tu sesión expiró. Vuelve a iniciar sesión.";
  // Errores de validación: Laravel resume en inglés ("… (and 1 more error)"); el detalle se muestra junto a cada campo.
  if (status === 422 && Object.keys(fieldErrors).length > 0) return "Revisa los datos marcados e inténtalo de nuevo.";
  return apiMessage || "No pudimos completar tu solicitud. Inténtalo de nuevo.";
}
