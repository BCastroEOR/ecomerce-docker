<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'currency' => ['required', 'string', 'size:3', Rule::in(['USD'])],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'items.required' => 'Debe incluir al menos un producto.',
            'items.min' => 'Debe incluir al menos un producto.',
            'items.*.product_id.exists' => 'El producto seleccionado no existe.',
            'items.*.product_id.distinct' => 'No puede repetir productos en la orden.',
            'items.*.quantity.min' => 'La cantidad debe ser mayor a cero.',
            'currency.in' => 'La moneda seleccionada no está soportada.',
        ];
    }
}
