<?php

namespace App\Http\Controllers;

use App\Actions\ProcessStripeWebhookAction;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Services\StripePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Stripe\Exception\ApiErrorException;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class PaymentController extends Controller
{
    use ApiResponseTrait;

    #[OA\Get(
        path: '/orders/{order}/payments',
        summary: 'Obtener pagos de una orden',
        tags: ['Payments'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'order', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
            new OA\Parameter(name: 'Idempotency-Key', in: 'header', required: false, schema: new OA\Schema(type: 'string'), description: 'Clave para repetir de forma segura la misma solicitud de pago.', example: 'order-1-payment-attempt-1'),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Pagos obtenidos exitosamente', content: new OA\JsonContent(ref: '#/components/schemas/PaymentListResponse')),
            new OA\Response(response: 401, description: 'Token ausente o inválido'),
            new OA\Response(response: 404, description: 'Orden no encontrada'),
        ],
    )]
    public function index(Order $order): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        if ($order->user_id !== $user->id) {
            return $this->errorResponse('Orden no encontrada.', [], 404);
        }

        return $this->successResponse(
            PaymentResource::collection($order->payments()->latest()->get()),
            'Pagos obtenidos exitosamente.',
        );
    }

    #[OA\Post(
        path: '/orders/{order}/payments',
        summary: 'Procesar un pago de Stripe para una orden',
        description: 'Crea y confirma un PaymentIntent usando el método de pago creado por Stripe.js. El importe siempre se calcula desde la orden.',
        tags: ['Payments'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'order', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/PaymentInput')),
        responses: [
            new OA\Response(response: 201, description: 'Pago procesado o requiere una acción adicional', content: new OA\JsonContent(ref: '#/components/schemas/PaymentResponse')),
            new OA\Response(response: 401, description: 'Token ausente o inválido'),
            new OA\Response(response: 403, description: 'La orden no pertenece al usuario autenticado'),
            new OA\Response(response: 404, description: 'Orden no encontrada'),
            new OA\Response(response: 422, description: 'Error de validación o rechazo de Stripe'),
        ],
    )]
    public function store(StorePaymentRequest $request, Order $order, StripePaymentService $stripe): JsonResponse
    {
        if ($order->status !== 'pending') {
            return $this->errorResponse('La orden no está disponible para pago.', [], 422);
        }

        $idempotencyKey = $request->header('Idempotency-Key', 'order-'.$order->id.'-'.sha1($request->validated('payment_method_id')));

        try {
            $paymentIntent = $stripe->createAndConfirm(
                $order,
                $request->validated('payment_method_id'),
                $idempotencyKey,
            );
        } catch (ApiErrorException $exception) {
            return $this->errorResponse('Stripe rechazó el pago.', [
                'stripe_error' => $exception->getError()?->message ?? 'No se pudo procesar el pago.',
            ], 422);
        }

        $payment = Payment::query()->firstOrCreate(
            ['stripe_payment_intent_id' => $paymentIntent->id],
            [
                'order_id' => $order->id,
                'status' => $paymentIntent->status,
                'amount_minor' => $paymentIntent->amount,
                'currency' => strtoupper($paymentIntent->currency),
                'paid_at' => $paymentIntent->status === 'succeeded' ? now() : null,
            ],
        );

        if ($paymentIntent->status === 'succeeded') {
            $order->update(['status' => 'paid']);
        }

        $payment->setAttribute('client_secret', $paymentIntent->client_secret);

        return $this->successResponse(
            new PaymentResource($payment),
            'Pago procesado exitosamente.',
            201,
        );
    }

    #[OA\Post(
        path: '/payments/stripe/webhook',
        summary: 'Recibir eventos de Stripe',
        tags: ['Payments'],
        parameters: [
            new OA\Parameter(name: 'Stripe-Signature', in: 'header', required: true, schema: new OA\Schema(type: 'string'), example: 't=1614265330,v1=...'),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(type: 'object', additionalProperties: true)),
        responses: [
            new OA\Response(response: 200, description: 'Evento procesado exitosamente', content: new OA\JsonContent(ref: '#/components/schemas/WebhookResponse')),
            new OA\Response(response: 400, description: 'Firma o evento inválido'),
        ],
    )]
    public function webhook(Request $request, ProcessStripeWebhookAction $processWebhook): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        if (! is_string($signature) || ! is_string($secret) || $secret === '') {
            return $this->errorResponse('Firma de webhook inválida.', [], 400);
        }

        try {
            $event = Webhook::constructEvent($payload, $signature, $secret);
        } catch (\UnexpectedValueException|SignatureVerificationException) {
            return $this->errorResponse('Firma o payload de webhook inválido.', [], 400);
        }

        if (! $processWebhook->handle($event)) {
            return $this->errorResponse('Webhook inválido o pago no encontrado.', [], 400);
        }

        return $this->successResponse(null, 'Webhook procesado exitosamente.');
    }
}
