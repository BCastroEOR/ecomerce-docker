import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Carrito",
};

export default function CartPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Tu carrito</h1>
      <CartView />
    </div>
  );
}
