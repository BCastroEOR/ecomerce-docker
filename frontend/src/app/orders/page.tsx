import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderStatusBadge } from "@/components/order-status";
import { Pagination, parsePage } from "@/components/pagination";
import { ListSkeleton } from "@/components/skeletons";
import { getOrders } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "Mis compras",
};

export default function OrdersPage({ searchParams }: PageProps<"/orders">) {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Historial de compras</h1>
        <p className="mt-2 text-zinc-600">Tus órdenes, de la más reciente a la más antigua.</p>
      </section>

      {/* Sección pesada (órdenes con sus productos): se transmite sin bloquear el resto de la página. */}
      <Suspense fallback={<ListSkeleton />}>
        <OrderList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function OrderList({ searchParams }: Pick<PageProps<"/orders">, "searchParams">) {
  const page = parsePage((await searchParams).page);
  const { data: orders, meta } = await getOrders(page);

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-zinc-600">Aún no tienes compras.</p>
        <Link href="/products" className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {orders.map((order) => {
          const units = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
          const names = order.items?.map((item) => item.product_name).join(", ");

          return (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">Orden #{order.id}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-600">
                    {units} {units === 1 ? "producto" : "productos"} · {names}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">{formatMoney(order.total)}</p>
                  <p className="text-xs text-zinc-500">{formatDate(order.created_at)}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <Pagination meta={meta} basePath="/orders" />
    </>
  );
}
