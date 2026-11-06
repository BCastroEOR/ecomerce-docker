"use client";

import Link from "next/link";
import { useState } from "react";
import { cart, useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

export function AddToCart({ product, compact = false }: { product: Product; compact?: boolean }) {
  const items = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inCart = items.find((item) => item.productId === product.id)?.quantity ?? 0;
  const available = product.stock - inCart;

  if (product.stock <= 0) {
    return <p className="text-sm font-medium text-red-600">Agotado</p>;
  }

  function add() {
    cart.add({ productId: product.id, name: product.name, price: Number(product.price), stock: product.stock }, compact ? 1 : quantity);
    setAdded(true);
    setQuantity(1);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={add}
        disabled={available <= 0}
        className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {available <= 0 ? "Sin más stock" : inCart > 0 ? `Agregar (${inCart})` : "Agregar"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm text-zinc-600">
          Cantidad
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={Math.max(available, 1)}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Math.min(Number(event.target.value) || 1, available)))}
          className="w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={add}
          disabled={available <= 0}
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {available <= 0 ? "Ya tienes todo el stock en el carrito" : "Agregar al carrito"}
        </button>
      </div>
      {added && (
        <p role="status" className="text-sm text-emerald-700">
          Producto agregado. <Link href="/cart" className="font-medium underline">Ver carrito</Link>
        </p>
      )}
    </div>
  );
}
