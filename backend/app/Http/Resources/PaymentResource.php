<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'stripe_payment_intent_id' => $this->stripe_payment_intent_id,
            'status' => $this->status,
            'amount_minor' => $this->amount_minor,
            'currency' => $this->currency,
            'failure_code' => $this->failure_code,
            'failure_message' => $this->failure_message,
            'client_secret' => $this->when($this->client_secret !== null, $this->client_secret),
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
        ];
    }
}
