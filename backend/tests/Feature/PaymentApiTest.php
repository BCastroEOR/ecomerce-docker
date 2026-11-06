<?php

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Services\StripePaymentService;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Stripe\PaymentIntent;

use function Pest\Laravel\mock;

uses(LazilyRefreshDatabase::class);

it('creates and confirms a payment intent using the order total', function () {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->create(['total' => 19.99]);
    $paymentIntent = PaymentIntent::constructFrom([
        'id' => 'pi_test_123',
        'amount' => 1999,
        'currency' => 'usd',
        'status' => 'requires_action',
        'client_secret' => 'pi_test_123_secret',
    ]);
    mock(StripePaymentService::class)
        ->shouldReceive('createAndConfirm')
        ->once()
        ->andReturn($paymentIntent);

    $response = $this->actingAs($user, 'api')->postJson('/api/orders/'.$order->id.'/payments', [
        'payment_method_id' => 'pm_test_123',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.status', 'requires_action')
        ->assertJsonPath('data.client_secret', 'pi_test_123_secret');
    $this->assertDatabaseHas('payments', [
        'order_id' => $order->id,
        'stripe_payment_intent_id' => 'pi_test_123',
        'amount_minor' => 1999,
    ]);
});

it('does not allow a user to register a payment for another users order', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $order = Order::factory()->for($owner)->create();

    $response = $this->actingAs($otherUser, 'api')->postJson('/api/orders/'.$order->id.'/payments', [
        'payment_method_id' => 'pm_test_forbidden',
    ]);

    $response->assertForbidden();
    expect(Payment::query()->count())->toBe(0);
});

it('marks a pending payment and order as paid from a valid stripe webhook', function () {
    config(['services.stripe.webhook_secret' => 'whsec_test']);
    $order = Order::factory()->create(['total' => 10, 'status' => 'pending']);
    $payment = Payment::factory()->for($order)->create([
        'stripe_payment_intent_id' => 'pi_webhook_123',
        'amount_minor' => 1000,
    ]);
    $payload = json_encode([
        'id' => 'evt_test_123',
        'type' => 'payment_intent.succeeded',
        'data' => ['object' => [
            'id' => $payment->stripe_payment_intent_id,
            'metadata' => [],
        ]],
    ], JSON_THROW_ON_ERROR);
    $timestamp = time();
    $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_test');

    $response = $this->call('POST', '/api/payments/stripe/webhook', [], [], [], [
        'HTTP_STRIPE_SIGNATURE' => 't='.$timestamp.',v1='.$signature,
        'CONTENT_TYPE' => 'application/json',
    ], $payload);

    $response->assertOk();
    $this->assertDatabaseHas('payments', ['id' => $payment->id, 'status' => 'succeeded', 'stripe_event_id' => 'evt_test_123']);
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
});

it('returns 400 for an invalid stripe webhook signature', function () {
    config(['services.stripe.webhook_secret' => 'whsec_test']);

    $response = $this->call('POST', '/api/payments/stripe/webhook', [], [], [], [
        'HTTP_STRIPE_SIGNATURE' => 't='.time().',v1=invalid',
        'CONTENT_TYPE' => 'application/json',
    ], '{}');

    $response->assertBadRequest();
});
