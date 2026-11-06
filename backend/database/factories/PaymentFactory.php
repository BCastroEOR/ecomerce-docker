<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'stripe_payment_intent_id' => fake()->unique()->bothify('pi_############'),
            'status' => 'pending',
            'amount_minor' => 1000,
            'currency' => 'USD',
            'metadata' => [],
        ];
    }
}
