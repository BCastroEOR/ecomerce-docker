"use client";

import Link from "next/link";
import { cart, cartTotals, useCart } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { ProductArt } from "./product-art";

export function CartView() {
  const items = useCart();
  const { count, subtotal } = cartTotals(items);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-zinc-600">Tu carrito está vacío.</p>
        <Link href="/products" className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            <ProductArt id={item.productId} name={item.name} className="size-16 shrink-0 rounded-xl [&>span]:text-lg" />
            <div className="min-w-0 flex-1">
              <Link href={`/products/${item.productId}`} className="font-medium hover:text-indigo-600">
                {item.name}
              </Link>
              <p className="text-sm text-zinc-500">{formatMoney(item.price)} c/u</p>
            </div>
            <div className="flex items-center rounded-lg border border-zinc-300" role="group" aria-label={`Cantidad de ${item.name}`}>
              <button
                type="button"
                onClick={() => cart.setQuantity(item.productId, item.quantity - 1)}
                className="px-3 py-1.5 text-zinc-700 hover:bg-zinc-100"
                aria-label="Quitar una unidad"
              >
                −
              </button>
              <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
              <button
                type="button"
                onClick={() => cart.setQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 disabled:opacity-30"
                aria-label="Agregar una unidad"
              >
                +
              </button>
            </div>
            <p className="w-24 text-right font-medium tabular-nums">{formatMoney(item.price * item.quantity)}</p>
            <button
              type="button"
              onClick={() => cart.remove(item.productId)}
              className="text-sm text-zinc-500 hover:text-red-600"
              aria-label={`Eliminar ${item.name}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <aside className="h-fit space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Resumen</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-600">Productos</dt>
            <dd>{count}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Subtotal estimado</dt>
            <dd>{formatMoney(subtotal)}</dd>
          </div>
        </dl>
        <p className="text-xs text-zinc-500">El total final se confirma al crear la orden.</p>
        <Link
          href="/checkout"
          className="block rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Continuar al checkout
        </Link>
      </aside>
    </div>
  );
}
