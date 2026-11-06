import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckoutSteps } from "@/components/checkout-steps";
import { OrderItemsTable } from "@/components/order-items";
import { OrderStatusBadge } from "@/components/order-status";
import { PanelSkeleton } from "@/components/skeletons";
import { getOrder } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "Detalle de orden",
};

export default function OrderPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  return (
    <div className="space-y-6">
      <Link href="/orders" className="text-sm text-zinc-600 hover:text-zinc-900">
        ← Volver al historial
      </Link>
      <Suspense fallback={<PanelSkeleton />}>
        <OrderDetail params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function OrderDetail({ params, searchParams }: Pick<PageProps<"/orders/[id]">, "params" | "searchParams">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const order = await getOrder(id);
  if (!order) notFound();

  const justPaid = query.status === "success";
  const payments = order.payments ?? [];

  return (
    <div className="space-y-8">
      {justPaid && (
        <div className="space-y-4">
          <CheckoutSteps current={3} />
          <section role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h1 className="text-2xl font-semibold text-emerald-800">
              {order.status === "paid" ? "¡Gracias por tu compra!" : "Estamos confirmando tu pago"}
            </h1>
            <p className="mt-1 text-emerald-700">
              {order.status === "paid"
                ? `El pago de la orden #${order.id} fue aprobado por ${formatMoney(order.total)}.`
                : "Stripe está procesando el pago. El estado se actualizará en cuanto recibamos la confirmación."}
            </p>
          </section>
        </div>
      )}

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {justPaid ? (
            <h2 className="text-xl font-semibold">Orden #{order.id}</h2>
          ) : (
            <h1 className="text-3xl font-semibold tracking-tight">Orden #{order.id}</h1>
          )}
          <p className="text-sm text-zinc-500">Creada el {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {order.status === "pending" && (
            <Link href={`/checkout/${order.id}`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              Pagar ahora
            </Link>
          )}
        </div>
      </header>

      <OrderItemsTable order={order} />

      <section className="space-y-3">
        <h2 className="font-semibold">Pagos</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-500">Esta orden aún no tiene pagos registrados.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white text-sm">
            {payments.map((payment) => (
              <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <span className="font-mono text-xs text-zinc-500">{payment.stripe_payment_intent_id}</span>
                <span className="capitalize">{payment.status.replaceAll("_", " ")}</span>
                <span className="font-medium tabular-nums">{formatMoney(payment.amount_minor / 100)}</span>
                <span className="text-zinc-500">{formatDate(payment.paid_at ?? payment.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
