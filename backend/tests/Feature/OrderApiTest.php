<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

it('returns 401 when no token is provided to create an order', function () {
    $product = Product::factory()->create();

    $response = $this->postJson('/api/orders', [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'currency' => 'USD',
    ]);

    $response->assertUnauthorized();
});

it('creates an order with server prices and decreases stock', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['price' => 12.50, 'stock' => 5]);

    $response = $this->actingAs($user, 'api')->postJson('/api/orders', [
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 1,
        ]],
        'currency' => 'USD',
    ]);

    $response->assertCreated()->assertJsonPath('data.total', '25.00');
    $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'total' => 25]);
    $this->assertDatabaseHas('order_items', [
        'product_id' => $product->id,
        'product_name' => $product->name,
        'unit_price' => 12.50,
        'quantity' => 2,
    ]);
    $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 3]);
});

it('returns 422 when the requested quantity exceeds stock', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock' => 1]);

    $response = $this->actingAs($user, 'api')->postJson('/api/orders', [
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
        'currency' => 'USD',
    ]);

    $response->assertUnprocessable();
    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 1]);
});

it('returns 404 when a user requests another users order', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $product = Product::factory()->create();

    $order = $this->actingAs($owner, 'api')->postJson('/api/orders', [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'currency' => 'USD',
    ])->json('data.id');

    $response = $this->actingAs($otherUser, 'api')->getJson('/api/orders/'.$order);

    $response->assertNotFound();
});
