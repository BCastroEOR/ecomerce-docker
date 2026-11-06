<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Product',
    title: 'Product',
    description: 'Producto',
    required: ['id', 'name', 'description', 'price', 'stock'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Camiseta'),
        new OA\Property(property: 'description', type: 'string', example: 'Camiseta de algodón de alta calidad'),
        new OA\Property(property: 'price', type: 'number', format: 'float', example: 19.99),
        new OA\Property(property: 'stock', type: 'integer', example: 100),
    ]
)]
#[OA\Schema(
    schema: 'ProductInput',
    title: 'ProductInput',
    description: 'Datos necesarios para crear o actualizar un producto',
    required: ['name', 'description', 'price', 'stock'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Camiseta'),
        new OA\Property(property: 'description', type: 'string', example: 'Camiseta de algodón de alta calidad'),
        new OA\Property(property: 'price', type: 'number', format: 'float', minimum: 0, example: 19.99),
        new OA\Property(property: 'stock', type: 'integer', minimum: 0, example: 100),
    ],
    type: 'object'
)]
#[Fillable(['name', 'description', 'price', 'stock'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
