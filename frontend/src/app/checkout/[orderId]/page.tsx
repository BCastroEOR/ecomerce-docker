import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckoutSteps } from "@/components/checkout-steps";
import { OrderItemsTable } from "@/components/order-items";
import { PaymentForm } from "@/components/payment-form";
import { PanelSkeleton } from "@/components/skeletons";
import { getOrder } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pago",
};

export default function PaymentPage({ params }: PageProps<"/checkout/[orderId]">) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Pago</h1>
        <CheckoutSteps current={2} />
      </div>
      <Suspense fallback={<PanelSkeleton />}>
        <OrderPayment params={params} />
      </Suspense>
    </div>
  );
}

async function OrderPayment({ params }: Pick<PageProps<"/checkout/[orderId]">, "params">) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) notFound();
  if (order.status !== "pending") redirect(`/orders/${order.id}`);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="space-y-3">
        <h2 className="font-semibold">Orden #{order.id}</h2>
        <OrderItemsTable order={order} />
      </section>
      <PaymentForm orderId={order.id} total={order.total} />
    </div>
  );
}
