"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  stock: number;
  quantity: number;
};

const STORAGE_KEY = "cart:v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    items = raw ? (JSON.parse(raw) as CartItem[]) : EMPTY;
  } catch {
    items = EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Sin almacenamiento disponible (modo privado): el carrito vive solo en memoria.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Mantiene sincronizadas varias pestañas abiertas.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    loaded = false;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return items;
}

export const cart = {
  add(product: Omit<CartItem, "quantity">, quantity = 1) {
    load();
    const existing = items.find((item) => item.productId === product.productId);
    const current = existing?.quantity ?? 0;
    const nextQuantity = Math.min(current + quantity, product.stock);
    if (nextQuantity <= 0) return;

    commit(
      existing
        ? items.map((item) => (item.productId === product.productId ? { ...item, ...product, quantity: nextQuantity } : item))
        : [...items, { ...product, quantity: nextQuantity }],
    );
  },
  setQuantity(productId: number, quantity: number) {
    load();
    if (quantity <= 0) return cart.remove(productId);
    commit(items.map((item) => (item.productId === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item)));
  },
  remove(productId: number) {
    load();
    commit(items.filter((item) => item.productId !== productId));
  },
  clear() {
    commit(EMPTY);
  },
};

/** Estado local del carrito, persistido en localStorage. En el servidor siempre está vacío. */
export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function cartTotals(list: CartItem[]) {
  return {
    count: list.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: list.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}
