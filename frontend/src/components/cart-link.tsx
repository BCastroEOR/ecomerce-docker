"use client";

import Link from "next/link";
import { cartTotals, useCart } from "@/lib/cart-store";

export function CartLink() {
  const { count } = cartTotals(useCart());

  return (
    <Link
      href="/cart"
      className="relative rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
      aria-label={`Carrito, ${count} productos`}
    >
      Carrito
      {count > 0 && (
        <span className="ml-1.5 inline-flex min-w-5 justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
