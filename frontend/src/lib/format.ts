const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const dateTime = new Intl.DateTimeFormat("es-SV", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/El_Salvador",
});

export function formatMoney(value: string | number) {
  return currency.format(typeof value === "string" ? Number(value) : value);
}

export function formatDate(value: string) {
  return dateTime.format(new Date(value));
}

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente de pago", className: "bg-amber-100 text-amber-800" },
  paid: { label: "Pagada", className: "bg-emerald-100 text-emerald-800" },
  failed: { label: "Pago fallido", className: "bg-red-100 text-red-800" },
  cancelled: { label: "Cancelada", className: "bg-zinc-200 text-zinc-700" },
};

export function orderStatus(status: string) {
  return ORDER_STATUS[status] ?? { label: status, className: "bg-zinc-200 text-zinc-700" };
}
