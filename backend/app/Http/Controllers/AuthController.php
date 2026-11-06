<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegistrarUsuarioRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use OpenApi\Attributes as OA;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    use ApiResponseTrait;

    #[OA\Post(
        path: '/register',
        summary: 'Registrar un usuario',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Ana Pérez'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', maxLength: 255, example: 'ana@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 8, example: 'secret123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', minLength: 8, example: 'secret123'),
                ],
                type: 'object'
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Usuario registrado exitosamente',
                content: new OA\JsonContent(ref: '#/components/schemas/AuthResponse')
            ),
            new OA\Response(response: 422, description: 'Error de validación'),
        ]
    )]
    public function store(RegistrarUsuarioRequest $request): JsonResponse
    {
        $userData = [
            ...$request->validated(),
            'role' => 'customer',
        ];

        $user = User::create($userData);

        $token = JWTAuth::fromUser($user);

        return $this->authResponse($token, $user, 'Usuario registrado exitosamente.', 201);
    }

    #[OA\Post(
        path: '/login',
        summary: 'Iniciar sesión',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'ana@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'secret123'),
                ],
                type: 'object'
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login exitoso',
                content: new OA\JsonContent(ref: '#/components/schemas/AuthResponse')
            ),
            new OA\Response(
                response: 401,
                description: 'Credenciales inválidas',
                content: new OA\JsonContent(ref: '#/components/schemas/ApiErrorResponse')
            ),
            new OA\Response(response: 422, description: 'Error de validación'),
        ]
    )]
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only(['email', 'password']);

        if (! $token = JWTAuth::attempt($credentials)) {
            return $this->errorResponse('Credenciales inválidas.', [], 401);
        }

        $user = JWTAuth::user();

        return $this->authResponse($token, $user, 'Login exitoso.');
    }

    #[OA\Post(
        path: '/logout',
        summary: 'Cerrar sesión',
        tags: ['Authentication'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 204, description: 'Sesión cerrada correctamente'),
            new OA\Response(response: 401, description: 'Token ausente o inválido'),
        ]
    )]
    public function logout(Request $request): Response
    {
        auth()->logout();

        return $this->noContentResponse();
    }
}
