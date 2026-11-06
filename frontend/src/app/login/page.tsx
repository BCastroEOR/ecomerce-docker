import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard, firstParam, FormSkeleton } from "@/components/auth-card";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard title="Iniciar sesión" subtitle="Ingresa para completar tus compras y ver tu historial.">
      <Suspense fallback={<FormSkeleton fields={2} />}>
        {searchParams.then((params) => (
          <LoginForm next={firstParam(params.next)} expired={firstParam(params.expired) === "1"} />
        ))}
      </Suspense>
    </AuthCard>
  );
}
