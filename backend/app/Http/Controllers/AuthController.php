<?php

namespace App\Http\Controllers;

use App\Models\AuthToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function signup(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ]);
        $data['email'] = strtolower($data['email']);
        $user = User::create($data);
        return $this->issueToken($user, 'Account created successfully.');
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $user = User::where('email', strtolower($data['email']))->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'The email or password is incorrect.'], 422);
        }
        return $this->issueToken($user, 'Signed in successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->userData($request->user())]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->attributes->get('auth_token')?->delete();
        return response()->json(['message' => 'Signed out successfully.']);
    }

    private function issueToken(User $user, string $message): JsonResponse
    {
        $raw = bin2hex(random_bytes(32));
        AuthToken::create(['user_id' => $user->id, 'token_hash' => hash('sha256', $raw), 'expires_at' => now()->addDays(7)]);
        return response()->json(['message' => $message, 'token' => $raw, 'data' => $this->userData($user)]);
    }

    private function userData(User $user): array
    {
        return ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'phone' => $user->phone, 'is_admin' => (bool) $user->is_admin];
    }
}
