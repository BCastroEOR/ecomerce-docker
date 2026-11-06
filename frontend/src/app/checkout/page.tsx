import type { Metadata } from "next";
import { CheckoutReview } from "@/components/checkout-review";
import { CheckoutSteps } from "@/components/checkout-steps";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <CheckoutSteps current={1} />
      </div>
      <CheckoutReview />
    </div>
  );
}
