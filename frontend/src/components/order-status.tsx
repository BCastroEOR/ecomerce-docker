import { orderStatus } from "@/lib/format";

export function OrderStatusBadge({ status }: { status: string }) {
  const { label, className } = orderStatus(status);
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}
