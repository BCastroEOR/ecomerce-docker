<?php

namespace App\Actions;

use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Stripe\Event;

class ProcessStripeWebhookAction
{
    public function handle(Event $event): bool
    {
        $eventId = $event->id;

        if (! is_string($eventId)) {
            return false;
        }

        if (! in_array($event->type, [
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'payment_intent.canceled',
        ], true)) {
            return true;
        }

        $paymentIntent = $event->data->object;

        return DB::transaction(function () use ($event, $eventId, $paymentIntent): bool {
            if (Payment::query()->where('stripe_event_id', $eventId)->exists()) {
                return true;
            }

            $payment = Payment::query()
                ->where('stripe_payment_intent_id', $paymentIntent->id)
                ->lockForUpdate()
                ->first();

            if ($payment === null) {
                return false;
            }

            $status = match ($event->type) {
                'payment_intent.succeeded' => 'succeeded',
                'payment_intent.payment_failed' => 'failed',
                'payment_intent.canceled' => 'cancelled',
                default => null,
            };

            if ($status === null) {
                return true;
            }

            $lastPaymentError = isset($paymentIntent->last_payment_error)
                ? $paymentIntent->last_payment_error
                : null;

            $payment->update([
                'stripe_event_id' => $eventId,
                'status' => $status,
                'failure_code' => $lastPaymentError?->code,
                'failure_message' => $lastPaymentError?->message,
                'paid_at' => $status === 'succeeded' ? now() : null,
                'metadata' => $paymentIntent->metadata?->toArray() ?? [],
            ]);

            if ($status === 'succeeded') {
                $payment->order()->update(['status' => 'paid']);
            }

            return true;
        });
    }
}
