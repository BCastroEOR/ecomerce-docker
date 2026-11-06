<?php

namespace App\Services;

use App\Models\Order;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\StripeClient;

class StripePaymentService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $secret = config('services.stripe.secret');

        if (! is_string($secret) || $secret === '') {
            throw new \RuntimeException('La clave secreta de Stripe no está configurada.');
        }

        $this->stripe = new StripeClient($secret);
    }

    /**
     * @throws ApiErrorException
     */
    public function createAndConfirm(Order $order, string $paymentMethodId, string $idempotencyKey): PaymentIntent
    {
        return $this->stripe->paymentIntents->create([
            'amount' => (int) round(((float) $order->total) * 100),
            'currency' => strtolower($order->currency),
            'payment_method' => $paymentMethodId,
            'confirm' => true,
            'automatic_payment_methods' => [
                'enabled' => true,
                'allow_redirects' => 'never',
            ],
            'metadata' => [
                'order_id' => (string) $order->id,
            ],
        ], [
            'idempotency_key' => $idempotencyKey,
        ]);
    }
}
