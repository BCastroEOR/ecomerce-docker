"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { createSession, deleteSession, getToken } from "@/lib/session";
import type { ApiSuccess, AuthData, FormState } from "@/lib/types";

/** Solo permite redirecciones internas para evitar open redirects. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/products";
}

function toFormState(error: unknown, values: Record<string, string>): FormState {
  if (error instanceof ApiError) {
    return { message: error.message, fieldErrors: error.fieldErrors, values };
  }
  throw error;
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "Ingresa tu correo y contraseña.", values: { email } };
  }

  try {
    const { data } = await api<ApiSuccess<AuthData>>("/login", { method: "POST", body: { email, password } });
    await createSession(data);
  } catch (error) {
    return toFormState(error, { email });
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const body = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    password_confirmation: String(formData.get("password_confirmation") ?? ""),
  };

  const values = { name: body.name, email: body.email };

  if (body.password !== body.password_confirmation) {
    return { fieldErrors: { password_confirmation: ["Las contraseñas no coinciden."] }, values };
  }

  try {
    const { data } = await api<ApiSuccess<AuthData>>("/register", { method: "POST", body });
    await createSession(data);
  } catch (error) {
    return toFormState(error, values);
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  const token = await getToken();

  if (token) {
    // Invalida el JWT en la API; si ya expiró, igual se elimina la cookie local.
    await api("/logout", { method: "POST", token }).catch(() => undefined);
  }

  await deleteSession();
  revalidatePath("/", "layout");
  redirect("/products");
}
