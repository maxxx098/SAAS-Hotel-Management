<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClientMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Check if user is a client
        if (!$user || $user->role !== 'client') {
            abort(403, 'Access denied. Client access required.');
        }
        
        return $next($request);
    }
}