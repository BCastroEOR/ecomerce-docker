import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "./api";
import { getToken } from "./session";
import type { ApiSuccess, Order, Paginated, Product } from "./types";

/*
 * Lecturas públicas: se cachean con "use cache" bajo la etiqueta "products".
 * Crear una orden descuenta stock, así que ese Server Action llama a
 * updateTag("products") para que el catálogo no quede desactualizado.
 */

export async function getProducts(page: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  return api<Paginated<Product>>(`/products?page=${page}`);
}

export async function getProduct(id: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products", `product-${id}`);

  try {
    const { data } = await api<ApiSuccess<Product>>(`/products/${encodeURIComponent(id)}`);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/*
 * Lecturas privadas: dependen del token del usuario, así que no se cachean en
 * el servidor y siempre reflejan el estado actual de la API.
 */

async function authorized<T>(path: string): Promise<T> {
  const token = await getToken();
  if (!token) redirect("/login");

  try {
    return await api<T>(path, { token });
  } catch (error) {
    // Token expirado o revocado: el Route Handler limpia la cookie y envía al login.
    if (error instanceof ApiError && error.status === 401) redirect("/auth/expired");
    throw error;
  }
}

export async function getOrders(page: number) {
  return authorized<Paginated<Order>>(`/orders?page=${page}`);
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    const { data } = await authorized<ApiSuccess<Order>>(`/orders/${encodeURIComponent(id)}`);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
