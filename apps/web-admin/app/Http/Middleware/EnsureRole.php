<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureRole
{
    protected array $hierarchy = [
        'SUPERADMIN' => 4,
        'ADMIN' => 3,
        'AFFILIATE' => 2,
        'MERCHANT' => 1,
    ];

    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = session('user');
        if (!$user) {
            return redirect()->route('login');
        }

        $userLevel = $this->hierarchy[$user['role']] ?? 0;

        foreach ($roles as $role) {
            $requiredLevel = $this->hierarchy[$role] ?? 0;
            if ($userLevel >= $requiredLevel) {
                return $next($request);
            }
        }

        abort(403, 'No tenés permisos para acceder a esta sección');
    }
}
