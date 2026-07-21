<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * This application exposes a JSON API only — it has no web login page.
 *
 * Forcing the Accept header guarantees that framework-generated responses
 * (validation errors, 401 Unauthenticated, 404s) are always rendered as JSON
 * instead of attempting an HTML redirect to a non-existent `login` route.
 */
class ForceJsonResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
