import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderItemsTable({ order }: { order: Order }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-500">
          <tr>
            <th className="px-4 py-2 font-medium">Producto</th>
            <th className="px-4 py-2 text-right font-medium">Precio</th>
            <th className="px-4 py-2 text-right font-medium">Cant.</th>
            <th className="px-4 py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {order.items?.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3">{item.product_name}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatMoney(item.unit_price)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
              <td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(item.line_total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-zinc-200">
          <tr>
            <td colSpan={3} className="px-4 py-3 text-right font-semibold">
              Total ({order.currency})
            </td>
            <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatMoney(order.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
