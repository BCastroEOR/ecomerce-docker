<?php

namespace App\Http\Requests;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $order = $this->route('order');

        return $order instanceof Order && $order->user_id === $this->user()?->id;
    }

    /** @return array<string, string[]> */
    public function rules(): array
    {
        return [
            'payment_method_id' => ['required', 'string', 'max:255'],
        ];
    }
}
