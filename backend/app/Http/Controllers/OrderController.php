<?php

namespace App\Http\Controllers;

use App\Actions\CreateOrderAction;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use RuntimeException;

class OrderController extends Controller
{
    use ApiResponseTrait;

    #[OA\Get(
        path: '/orders',
        summary: 'Obtener las órdenes del usuario autenticado',
        tags: ['Orders'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, default: 1), example: 1),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Órdenes obtenidas exitosamente', content: new OA\JsonContent(ref: '#/components/schemas/OrderListResponse')),
            new OA\Response(response: 401, description: 'Token ausente o inválido'),
        ],
    )]
    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();
        $orders = $user->orders()->with('items.product')->latest()->paginate(10);

        return $this->paginatedResponse(
            OrderResource::collection($orders),
            $orders,
            'Órdenes obtenidas exitosamente.',
        );
    }

    #[OA\Post(
        path: '/orders',
        summary: 'Crear una orden',
        description: 'Calcula los importes en el servidor y descuenta el stock dentro de una transacción.',
        tags: ['Orders'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/OrderInput')),
        responses: [
            new OA\Response(response: 201, description: 'Orden creada exitosamente', content: new OA\JsonContent(ref: '#/components/schemas/OrderResponse')),
            new OA\Response(response: 401, description: 'Token ausente o inválido'),
            new OA\Response(response: 422, description: 'Error de validación o stock insuficiente'),
        ],
    )]
    public function store(StoreOrderRequest $request, CreateOrderAction $createOrder): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $order = $createOrder->handle($user, $request->validated());
        } catch (RuntimeException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 422);
        }

        return $this->successResponse(
            new OrderResource($order),
            'Orden creada exitosamente.',
            201,
        );
    }

    #[OA\Get(
        path: '/orders/{order}',
        summary: 'Obtener una orden',
        tags: ['Orders'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'order', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Orden obtenida exitosamente', content: new OA\JsonContent(ref: '#/components/schemas/OrderResponse')),
            new OA\Response(response: 401, description: 'Token ausente o inválido'),
            new OA\Response(response: 404, description: 'Orden no encontrada'),
        ],
    )]
    public function show(Order $order): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        if ($order->user_id !== $user->id) {
            return $this->errorResponse('Orden no encontrada.', [], 404);
        }

        return $this->successResponse(
            new OrderResource($order->load('items.product', 'payments')),
            'Orden obtenida exitosamente.',
        );
    }
}
