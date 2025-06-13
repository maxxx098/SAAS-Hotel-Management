<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return redirect()->route('login');
        }

        // Check if user is staff using your User model's isStaff() method
        if (!$request->user()->isStaff()) {
            // Redirect to dashboard with error for Inertia
            return redirect()->route('dashboard')->with('error', 'Access denied. Staff privileges required.');
        }

        return $next($request);
    }
}