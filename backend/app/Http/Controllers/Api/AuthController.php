<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Register a new (regular) user and issue an API token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'password' => $request->string('password'),
            'role' => UserRole::User,
        ]);

        return $this->tokenResponse($user, Response::HTTP_CREATED);
    }

    /**
     * Verify credentials and issue an API token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check((string) $request->string('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return $this->tokenResponse($user, Response::HTTP_OK);
    }

    /**
     * Return the currently authenticated user.
     */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    /**
     * Revoke the token used for the current request.
     */
    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    /**
     * Build a consistent auth response containing the user and a fresh token.
     */
    private function tokenResponse(User $user, int $status): JsonResponse
    {
        $token = $user->createToken('spa')->plainTextToken;

        return (new UserResource($user))
            ->additional(['token' => $token])
            ->response()
            ->setStatusCode($status);
    }
}
