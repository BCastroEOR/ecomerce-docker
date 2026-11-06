"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createOrder } from "@/app/actions/orders";
import { cart, cartTotals, useCart } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";

export function CheckoutReview() {
  const items = useCart();
  const { subtotal } = cartTotals(items);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-zinc-600">No hay productos para crear una orden.</p>
        <Link href="/products" className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Ver catálogo
        </Link>
      </div>
    );
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createOrder(items.map((item) => ({ product_id: item.productId, quantity: item.quantity })));

      if (!result.ok) {
        setError(result.message);
        return;
      }

      // La orden ya existe en la API con su stock reservado: el carrito local se vacía.
      cart.clear();
      router.push(`/checkout/${result.orderId}`);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
        {items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-4 p-4 text-sm">
            <span>
              {item.name} <span className="text-zinc-500">× {item.quantity}</span>
            </span>
            <span className="font-medium tabular-nums">{formatMoney(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <aside className="h-fit space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex justify-between font-semibold">
          <span>Subtotal estimado</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Creando orden…" : "Confirmar y crear orden"}
        </button>
        <Link href="/cart" className="block text-center text-sm text-zinc-600 hover:text-zinc-900">
          Editar carrito
        </Link>
      </aside>
    </div>
  );
}
