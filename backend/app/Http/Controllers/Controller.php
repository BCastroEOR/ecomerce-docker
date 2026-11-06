<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'E-commerce API  ',
    description: 'API para la gestión de productos en un sistema de comercio electrónico.',
)]
#[OA\Server(
    url: 'http://localhost:8000/api',
    description: 'Servidor local'
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Token JWT en formato Bearer'
)]
#[OA\Schema(
    schema: 'AuthData',
    properties: [
        new OA\Property(property: 'token', type: 'string', example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'),
        new OA\Property(property: 'token_type', type: 'string', example: 'bearer'),
        new OA\Property(property: 'expires_in', type: 'integer', example: 3600),
        new OA\Property(property: 'user', ref: '#/components/schemas/User'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'ApiSuccessResponse',
    required: ['success', 'message'],
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Operación exitosa.'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'ApiErrorResponse',
    required: ['success', 'message', 'errors'],
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: false),
        new OA\Property(property: 'message', type: 'string', example: 'Ocurrió un error.'),
        new OA\Property(property: 'errors', type: 'object', additionalProperties: true),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'PaginationMeta',
    properties: [
        new OA\Property(property: 'current_page', type: 'integer', example: 1),
        new OA\Property(property: 'from', type: 'integer', nullable: true, example: 1),
        new OA\Property(property: 'last_page', type: 'integer', example: 5),
        new OA\Property(property: 'per_page', type: 'integer', example: 10),
        new OA\Property(property: 'to', type: 'integer', nullable: true, example: 10),
        new OA\Property(property: 'total', type: 'integer', example: 50),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'PaginationLinks',
    properties: [
        new OA\Property(property: 'first', type: 'string', format: 'uri', nullable: true),
        new OA\Property(property: 'last', type: 'string', format: 'uri', nullable: true),
        new OA\Property(property: 'previous', type: 'string', format: 'uri', nullable: true),
        new OA\Property(property: 'next', type: 'string', format: 'uri', nullable: true),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'AuthResponse',
    allOf: [new OA\Schema(ref: '#/components/schemas/ApiSuccessResponse')],
    properties: [
        new OA\Property(property: 'data', ref: '#/components/schemas/AuthData'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'ProductResponse',
    allOf: [new OA\Schema(ref: '#/components/schemas/ApiSuccessResponse')],
    properties: [
        new OA\Property(property: 'data', ref: '#/components/schemas/Product'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'ProductListResponse',
    allOf: [new OA\Schema(ref: '#/components/schemas/ApiSuccessResponse')],
    properties: [
        new OA\Property(
            property: 'data',
            type: 'array',
            items: new OA\Items(ref: '#/components/schemas/Product')
        ),
        new OA\Property(property: 'meta', ref: '#/components/schemas/PaginationMeta'),
        new OA\Property(property: 'links', ref: '#/components/schemas/PaginationLinks'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'OrderItem',
    required: ['id', 'product_id', 'product_name', 'unit_price', 'quantity', 'line_total'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'product_id', type: 'integer', nullable: true, example: 1),
        new OA\Property(property: 'product_name', type: 'string', example: 'Camiseta'),
        new OA\Property(property: 'unit_price', type: 'string', format: 'decimal', example: '19.99'),
        new OA\Property(property: 'quantity', type: 'integer', example: 2),
        new OA\Property(property: 'line_total', type: 'string', format: 'decimal', example: '39.98'),
        new OA\Property(property: 'product', ref: '#/components/schemas/Product', nullable: true),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'Order',
    required: ['id', 'status', 'currency', 'subtotal', 'total', 'created_at'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'], example: 'pending'),
        new OA\Property(property: 'currency', type: 'string', example: 'USD'),
        new OA\Property(property: 'subtotal', type: 'string', format: 'decimal', example: '39.98'),
        new OA\Property(property: 'total', type: 'string', format: 'decimal', example: '39.98'),
        new OA\Property(property: 'items', type: 'array', items: new OA\Items(ref: '#/components/schemas/OrderItem'), nullable: true),
        new OA\Property(property: 'payments', type: 'array', items: new OA\Items(ref: '#/components/schemas/Payment'), nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'Payment',
    required: ['id', 'order_id', 'stripe_payment_intent_id', 'status', 'amount_minor', 'currency'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'order_id', type: 'integer', example: 1),
        new OA\Property(property: 'stripe_payment_intent_id', type: 'string', example: 'pi_3MtwBwLkdIwHu7ix28a3tqPa'),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'succeeded', 'processing', 'requires_action', 'requires_payment_method', 'failed', 'cancelled'], example: 'succeeded'),
        new OA\Property(property: 'amount_minor', type: 'integer', example: 3998),
        new OA\Property(property: 'currency', type: 'string', example: 'USD'),
        new OA\Property(property: 'failure_code', type: 'string', nullable: true, example: null),
        new OA\Property(property: 'failure_message', type: 'string', nullable: true, example: null),
        new OA\Property(property: 'client_secret', type: 'string', nullable: true, example: 'pi_..._secret_...'),
        new OA\Property(property: 'paid_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'OrderItemInput',
    required: ['product_id', 'quantity'],
    properties: [
        new OA\Property(property: 'product_id', type: 'integer', example: 1),
        new OA\Property(property: 'quantity', type: 'integer', minimum: 1, example: 2),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'OrderInput',
    required: ['items', 'currency'],
    properties: [
        new OA\Property(property: 'items', type: 'array', minItems: 1, items: new OA\Items(ref: '#/components/schemas/OrderItemInput')),
        new OA\Property(property: 'currency', type: 'string', minLength: 3, maxLength: 3, enum: ['USD'], example: 'USD'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'PaymentInput',
    required: ['payment_method_id'],
    properties: [
        new OA\Property(property: 'payment_method_id', type: 'string', description: 'ID creado por Stripe.js. Nunca enviar datos crudos de tarjeta.', example: 'pm_card_visa'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'OrderResponse',
    allOf: [new OA\Schema(ref: '#/components/schemas/ApiSuccessResponse')],
    properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Order')],
    type: 'object'
)]
#[OA\Schema(
    schema: 'OrderListResponse',
    allOf: [new OA\Schema(ref: '#/components/schemas/ApiSuccessResponse')],
    properties: [
        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Order')),
        new OA\Property(property: 'meta', ref: '#/components/schemas/PaginationMeta'),
        new OA\Property(property: 'links', ref: '#/components/schemas/PaginationLinks'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'PaymentResponse',
    allOf: [new OA\Schema(ref: '#/components/schemas/ApiSuccessResponse')],
    properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Payment')],
    type: 'object'
)]
#[OA\Schema(
    schema: 'PaymentListResponse',
    allOf: [new OA\Schema(ref: '#/components/schemas/ApiSuccessResponse')],
    properties: [new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Payment'))],
    type: 'object'
)]
#[OA\Schema(
    schema: 'WebhookResponse',
    allOf: [new OA\Schema(ref: '#/components/schemas/ApiSuccessResponse')],
    properties: [new OA\Property(property: 'data', nullable: true)],
    type: 'object'
)]
abstract class Controller
{
    //
}
