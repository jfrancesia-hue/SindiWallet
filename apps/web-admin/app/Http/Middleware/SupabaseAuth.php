<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SupabaseAuth
{
    public function handle(Request $request, Closure $next)
    {
        if (!session('access_token') || !session('user')) {
            return redirect()->route('login');
        }

        // Share user data with all views
        view()->share('authUser', session('user'));
        view()->share('currentOrg', session('user')['organization'] ?? null);

        return $next($request);
    }
}
