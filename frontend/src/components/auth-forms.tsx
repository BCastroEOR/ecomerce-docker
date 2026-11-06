"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register } from "@/app/actions/auth";
import type { FormState } from "@/lib/types";
import { Field, FormAlert, SubmitButton } from "./form";

const initialState: FormState = {};

export function LoginForm({ next, expired }: { next?: string; expired?: boolean }) {
  const [state, action] = useActionState(login, initialState);

  return (
    <form action={action} className="space-y-4">
      {expired && !state.message && (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Tu sesión expiró. Vuelve a iniciar sesión.
        </p>
      )}
      <FormAlert message={state.message} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Correo electrónico" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} errors={state.fieldErrors} />
      <Field label="Contraseña" name="password" type="password" autoComplete="current-password" required errors={state.fieldErrors} />
      <SubmitButton pendingText="Ingresando…">Ingresar</SubmitButton>
      <p className="text-center text-sm text-zinc-600">
        ¿No tienes cuenta?{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-medium text-indigo-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState(register, initialState);

  return (
    <form action={action} className="space-y-4">
      <FormAlert message={state.message} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Nombre completo" name="name" autoComplete="name" required defaultValue={state.values?.name} errors={state.fieldErrors} />
      <Field label="Correo electrónico" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} errors={state.fieldErrors} />
      <Field label="Contraseña" name="password" type="password" autoComplete="new-password" minLength={8} required errors={state.fieldErrors} />
      <Field
        label="Confirmar contraseña"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        errors={state.fieldErrors}
      />
      <SubmitButton pendingText="Creando cuenta…">Crear cuenta</SubmitButton>
      <p className="text-center text-sm text-zinc-600">
        ¿Ya tienes cuenta?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-medium text-indigo-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
