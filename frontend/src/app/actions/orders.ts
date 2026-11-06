"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { ApiSuccess, Order, Payment } from "@/lib/types";

export type CartLine = { product_id: number; quantity: number };

type ActionError = { ok: false; message: string };

async function requireToken() {
  const token = await getToken();
  if (!token) redirect("/login?next=/checkout");
  return token;
}

function failure(error: unknown): ActionError {
  if (error instanceof ApiError) {
    if (error.status === 401) redirect("/auth/expired");

    // Stripe responde en inglés y con detalle técnico: se muestra un mensaje claro para el comprador.
    if (error.fieldErrors.stripe_error) {
      return { ok: false, message: "Tu tarjeta fue rechazada. Verifica los datos o intenta con otra tarjeta." };
    }

    const details = Object.values(error.fieldErrors).flat();
    return { ok: false, message: details[0] ?? error.message };
  }
  throw error;
}

/**
 * Crea la orden en la API. Los importes se calculan en el servidor de Laravel;
 * aquí solo se envían ids y cantidades.
 */
export async function createOrder(items: CartLine[]): Promise<{ ok: true; orderId: number } | ActionError> {
  const token = await requireToken();

  const lines = items
    .filter((item) => Number.isInteger(item.product_id) && Number.isInteger(item.quantity) && item.quantity > 0)
    .map(({ product_id, quantity }) => ({ product_id, quantity }));

  if (lines.length === 0) {
    return { ok: false, message: "Tu carrito está vacío." };
  }

  let order: Order;
  try {
    ({ data: order } = await api<ApiSuccess<Order>>("/orders", {
      method: "POST",
      token,
      body: { items: lines, currency: "USD" },
    }));
  } catch (error) {
    return failure(error);
  }

  // La orden descontó stock: el catálogo cacheado debe mostrarlo de inmediato.
  updateTag("products");
  revalidatePath("/orders");

  return { ok: true, orderId: order.id };
}

export type PayResult =
  | { ok: true; status: string; clientSecret?: string }
  | ActionError;

/**
 * Envía el PaymentMethod creado por Stripe.js al endpoint de pagos de la API,
 * que crea y confirma el PaymentIntent con la clave secreta.
 */
export async function payOrder(orderId: number, paymentMethodId: string): Promise<PayResult> {
  const token = await requireToken();

  if (!paymentMethodId.startsWith("pm_")) {
    return { ok: false, message: "Método de pago inválido." };
  }

  let payment: Payment;
  try {
    ({ data: payment } = await api<ApiSuccess<Payment>>(`/orders/${orderId}/payments`, {
      method: "POST",
      token,
      body: { payment_method_id: paymentMethodId },
    }));
  } catch (error) {
    // Un rechazo de Stripe llega como 422 con errors.stripe_error, que failure() traduce.
    return failure(error);
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);

  return { ok: true, status: payment.status, clientSecret: payment.client_secret };
}

/** Refresca el historial y lleva a la confirmación de compra. */
export async function finishCheckout(orderId: number) {
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  redirect(`/orders/${orderId}?status=success`);
}
