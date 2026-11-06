"use client";

import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { finishCheckout, payOrder } from "@/app/actions/orders";
import { formatMoney } from "@/lib/format";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const isConfigured = Boolean(publishableKey && publishableKey.startsWith("pk_") && !publishableKey.includes("xxxx"));

// Stripe.js solo se descarga cuando se renderiza esta pantalla (no afecta al catálogo).
const stripePromise = isConfigured ? loadStripe(publishableKey!) : null;

type Props = { orderId: number; total: string };

export function PaymentForm(props: Props) {
  if (!stripePromise) {
    return <PaymentUnavailable />;
  }

  return (
    <Elements stripe={stripePromise} options={{ locale: "es" }}>
      <CardForm {...props} />
    </Elements>
  );
}

function PaymentUnavailable() {
  useEffect(() => {
    // Aviso técnico solo para desarrolladores; el comprador ve un mensaje genérico.
    console.warn("[pago] Falta NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en .env.local: el formulario de Stripe está deshabilitado.");
  }, []);

  return (
    <div role="alert" className="h-fit rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
      <p className="font-medium">Los pagos en línea no están disponibles en este momento.</p>
      <p className="mt-1">
        Tu orden quedó guardada. Puedes pagarla más tarde desde{" "}
        <Link href="/orders" className="font-medium underline">
          Mis compras
        </Link>
        .
      </p>
    </div>
  );
}

function CardForm({ orderId, total }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    setError(null);
    startTransition(async () => {
      // 1. Stripe.js tokeniza la tarjeta: los datos nunca pasan por nuestro servidor.
      const { paymentMethod, error: cardError } = await stripe.createPaymentMethod({
        type: "card",
        card,
        billing_details: { name: name || undefined },
      });

      if (cardError || !paymentMethod) {
        setError(cardError?.message ?? "No se pudo validar la tarjeta.");
        return;
      }

      // 2. Server Action -> POST /orders/{id}/payments en la API de Laravel.
      const result = await payOrder(orderId, paymentMethod.id);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      // 3. Autenticación adicional (3D Secure) cuando el banco la solicita.
      if (result.status === "requires_action" && result.clientSecret) {
        const { error: actionError } = await stripe.handleNextAction({ clientSecret: result.clientSecret });
        if (actionError) {
          setError(actionError.message ?? "No se completó la autenticación del pago.");
          return;
        }
      } else if (result.status !== "succeeded" && result.status !== "processing") {
        setError("El pago no fue aprobado. Intenta con otra tarjeta.");
        return;
      }

      await finishCheckout(orderId);
    });
  }

  return (
    <form onSubmit={submit} className="h-fit space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="font-semibold">Datos de pago</h2>
      <div className="space-y-1.5">
        <label htmlFor="cardholder" className="block text-sm font-medium text-zinc-700">
          Nombre en la tarjeta
        </label>
        <input
          id="cardholder"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="cc-name"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
        />
      </div>
      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-zinc-700">Tarjeta</span>
        <CardElement
          className="stripe-input"
          options={{ hidePostalCode: true, style: { base: { fontSize: "15px", color: "#18181b" } } }}
        />
        <p className="text-xs text-zinc-500">
          Modo test: usa <span className="font-mono">4242 4242 4242 4242</span>, cualquier fecha futura y CVC.
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Procesando pago…" : `Pagar ${formatMoney(total)}`}
      </button>
    </form>
  );
}
