<?php

namespace App\Http\Middleware;

use App\Models\AuthToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $raw = $request->bearerToken();
        $token = $raw ? AuthToken::with('user')->where('token_hash', hash('sha256', $raw))->first() : null;

        if (!$token || $token->expires_at->isPast()) {
            return response()->json(['message' => 'Please sign in to continue.'], 401);
        }

        $request->setUserResolver(fn () => $token->user);
        $request->attributes->set('auth_token', $token);
        return $next($request);
    }
}
