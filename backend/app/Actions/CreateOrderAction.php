<?php

namespace App\Actions;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CreateOrderAction
{
    /** @param array{items: array<int, array{product_id: int, quantity: int}>, currency: string} $data */
    public function handle(User $user, array $data): Order
    {
        return DB::transaction(function () use ($user, $data): Order {
            $subtotalMinor = 0;
            $items = [];

            foreach ($data['items'] as $item) {
                $product = Product::query()->whereKey($item['product_id'])->lockForUpdate()->first();

                if ($product === null || $product->stock < $item['quantity']) {
                    throw new RuntimeException('Stock insuficiente para uno de los productos.');
                }

                $unitPriceMinor = (int) round(((float) $product->price) * 100);
                $lineTotalMinor = $unitPriceMinor * $item['quantity'];
                $subtotalMinor += $lineTotalMinor;
                $items[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'unit_price' => number_format($unitPriceMinor / 100, 2, '.', ''),
                    'line_total' => number_format($lineTotalMinor / 100, 2, '.', ''),
                ];

                $product->decrement('stock', $item['quantity']);
            }

            $total = number_format($subtotalMinor / 100, 2, '.', '');
            $order = $user->orders()->create([
                'status' => 'pending',
                'currency' => $data['currency'],
                'subtotal' => $total,
                'total' => $total,
            ]);

            foreach ($items as $item) {
                $order->items()->create([
                    'product_id' => $item['product']->id,
                    'product_name' => $item['product']->name,
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'line_total' => $item['line_total'],
                ]);
            }

            return $order->load('items.product');
        });
    }
}
