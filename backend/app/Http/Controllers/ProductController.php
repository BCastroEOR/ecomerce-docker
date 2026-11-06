<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    use ApiResponseTrait;

    #[OA\Get(
        path: '/products',
        summary: 'Obtener lista de productos',
        tags: ['Products'],
        parameters: [
            new OA\Parameter(
                name: 'page',
                in: 'query',
                description: 'Número de página',
                required: false,
                schema: new OA\Schema(type: 'integer', minimum: 1, default: 1),
                example: 1
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista paginada de productos',
                content: new OA\JsonContent(ref: '#/components/schemas/ProductListResponse')
            ),
        ]
    )]
    public function index(): JsonResponse
    {
        $products = Product::paginate(10);

        return $this->paginatedResponse(
            ProductResource::collection($products),
            $products,
            'Productos obtenidos exitosamente.'
        );
    }

    #[OA\Post(
        path: '/products',
        summary: 'Crear un producto',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/ProductInput')
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Producto creado exitosamente',
                content: new OA\JsonContent(ref: '#/components/schemas/ProductResponse')
            ),
            new OA\Response(response: 401, description: 'Token ausente o inválido'),
            new OA\Response(response: 422, description: 'Error de validación'),
        ]
    )]
    public function store(ProductRequest $request)
    {
        $product = Product::create($request->validated());

        return $this->successResponse(
            new ProductResource($product),
            'Producto creado exitosamente.',
            201
        );
    }

    #[OA\Get(
        path: '/products/{product}',
        summary: 'Obtener un producto',
        tags: ['Products'],
        parameters: [
            new OA\Parameter(
                name: 'product',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Producto obtenido exitosamente',
                content: new OA\JsonContent(ref: '#/components/schemas/ProductResponse')
            ),
            new OA\Response(response: 404, description: 'Producto no encontrado'),
        ]
    )]
    public function show(string $id)
    {
        $product = Product::find($id);

        if ($product) {
            return $this->successResponse(new ProductResource($product));
        }

        return $this->errorResponse('Producto no encontrado', [], 404);
    }

    #[OA\Put(
        path: '/products/{product}',
        summary: 'Actualizar un producto',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'product',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/ProductInput')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Producto actualizado exitosamente',
                content: new OA\JsonContent(ref: '#/components/schemas/ProductResponse')
            ),
            new OA\Response(response: 401, description: 'Token ausente o inválido'),
            new OA\Response(response: 404, description: 'Producto no encontrado'),
            new OA\Response(response: 422, description: 'Error de validación'),
        ]
    )]
    #[OA\Patch(
        path: '/products/{product}',
        summary: 'Actualizar parcialmente un producto',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'product',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/ProductInput')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Producto actualizado exitosamente',
                content: new OA\JsonContent(ref: '#/components/schemas/ProductResponse')
            ),
            new OA\Response(response: 401, description: 'Token ausente o inválido'),
            new OA\Response(response: 404, description: 'Producto no encontrado'),
            new OA\Response(response: 422, description: 'Error de validación'),
        ]
    )]
    public function update(ProductRequest $request, string $id)
    {
        $product = Product::find($id);

        if ($product) {
            $product->update($request->validated());

            return $this->successResponse(new ProductResource($product));
        }

        return $this->errorResponse('Producto no encontrado', [], 404);
    }

    #[OA\Delete(
        path: '/products/{product}',
        summary: 'Eliminar un producto',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'product',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            ),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Producto eliminado correctamente'),
            new OA\Response(response: 401, description: 'Token ausente o inválido'),
            new OA\Response(response: 404, description: 'Producto no encontrado'),
        ]
    )]
    public function destroy(string $id)
    {
        $product = Product::find($id);

        if ($product) {
            $product->delete();
            return $this->noContentResponse();
        }

        return $this->errorResponse('Producto no encontrado', [], 404);
    }
}
