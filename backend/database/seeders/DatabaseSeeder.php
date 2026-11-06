<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Demo Admin',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        $customer = User::factory()->create([
            'name' => 'Demo Customer',
            'email' => 'test@example.com',
            'role' => 'customer',
        ]);

        $laptop = Product::factory()->create([
            'name' => 'Laptop Pro 14',
            'description' => 'Laptop de 14 pulgadas para trabajo y estudio.',
            'price' => 899.99,
            'stock' => 9,
        ]);

        $headphones = Product::factory()->create([
            'name' => 'Auriculares Inalámbricos',
            'description' => 'Auriculares Bluetooth con cancelación de ruido.',
            'price' => 129.99,
            'stock' => 18,
        ]);

        $keyboard = Product::factory()->create([
            'name' => 'Teclado Mecánico',
            'description' => 'Teclado mecánico compacto con retroiluminación.',
            'price' => 79.99,
            'stock' => 14,
        ]);

        $pendingOrder = Order::factory()->for($customer)->create([
            'status' => 'pending',
            'subtotal' => 1159.97,
            'total' => 1159.97,
        ]);

        OrderItem::factory()->for($pendingOrder)->for($laptop)->create([
            'product_name' => $laptop->name,
            'unit_price' => $laptop->price,
            'quantity' => 1,
            'line_total' => 899.99,
        ]);

        OrderItem::factory()->for($pendingOrder)->for($headphones)->create([
            'product_name' => $headphones->name,
            'unit_price' => $headphones->price,
            'quantity' => 2,
            'line_total' => 259.98,
        ]);

        Payment::factory()->for($pendingOrder)->create([
            'stripe_payment_intent_id' => 'pi_demo_pending_001',
            'status' => 'pending',
            'amount_minor' => 115997,
            'metadata' => ['source' => 'demo-seeder'],
        ]);

        $paidOrder = Order::factory()->for($customer)->create([
            'status' => 'paid',
            'subtotal' => 79.99,
            'total' => 79.99,
        ]);

        OrderItem::factory()->for($paidOrder)->for($keyboard)->create([
            'product_name' => $keyboard->name,
            'unit_price' => $keyboard->price,
            'quantity' => 1,
            'line_total' => 79.99,
        ]);

        Payment::factory()->for($paidOrder)->create([
            'stripe_payment_intent_id' => 'pi_demo_succeeded_001',
            'stripe_event_id' => 'evt_demo_succeeded_001',
            'status' => 'succeeded',
            'amount_minor' => 7999,
            'paid_at' => now(),
            'metadata' => ['source' => 'demo-seeder'],
        ]);
    }
}
