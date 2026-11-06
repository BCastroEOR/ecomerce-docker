import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard, firstParam, FormSkeleton } from "@/components/auth-card";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <AuthCard title="Crear cuenta" subtitle="Regístrate para comprar y llevar el control de tus órdenes.">
      <Suspense fallback={<FormSkeleton fields={4} />}>
        {searchParams.then((params) => (
          <RegisterForm next={firstParam(params.next)} />
        ))}
      </Suspense>
    </AuthCard>
  );
}
