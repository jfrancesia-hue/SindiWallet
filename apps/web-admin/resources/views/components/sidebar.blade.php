@props(['authUser' => null])

<aside
    x-cloak
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    class="fixed inset-y-0 left-0 z-40 w-64 flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:translate-x-0"
    style="background-color: #1F2B6C;"
>
    {{-- Logo --}}
    <div class="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color: #00A89D;">
            <span class="text-white font-bold text-sm">SW</span>
        </div>
        <div>
            <span class="text-white font-bold text-base leading-none">SindiWallet</span>
            <span class="block text-xs text-blue-300 mt-0.5">Panel Admin</span>
        </div>
    </div>

    {{-- Navigation --}}
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">

        @php
            $navItems = [
                ['route' => 'dashboard', 'label' => 'Dashboard', 'icon' => 'dashboard', 'roles' => ['SUPERADMIN', 'ADMIN', 'AFFILIATE', 'MERCHANT']],
                ['route' => 'users.index', 'label' => 'Usuarios', 'icon' => 'users', 'roles' => ['SUPERADMIN', 'ADMIN']],
                ['route' => 'organizations.index', 'label' => 'Organizaciones', 'icon' => 'organizations', 'roles' => ['SUPERADMIN']],
                ['route' => 'transactions.index', 'label' => 'Transacciones', 'icon' => 'transactions', 'roles' => ['SUPERADMIN', 'ADMIN']],
                ['route' => 'dues.index', 'label' => 'Cuotas', 'icon' => 'dues', 'roles' => ['SUPERADMIN', 'ADMIN']],
                ['route' => 'benefits.index', 'label' => 'Beneficios', 'icon' => 'benefits', 'roles' => ['SUPERADMIN', 'ADMIN']],
                ['route' => 'loans.index', 'label' => 'Préstamos', 'icon' => 'loans', 'roles' => ['SUPERADMIN', 'ADMIN']],
                ['route' => 'merchants.index', 'label' => 'Comercios', 'icon' => 'merchants', 'roles' => ['SUPERADMIN', 'ADMIN']],
                ['route' => 'reports.index', 'label' => 'Reportes', 'icon' => 'reports', 'roles' => ['SUPERADMIN', 'ADMIN']],
                ['route' => 'notifications.index', 'label' => 'Notificaciones', 'icon' => 'notifications', 'roles' => ['SUPERADMIN', 'ADMIN']],
                ['route' => 'settings.index', 'label' => 'Configuración', 'icon' => 'settings', 'roles' => ['SUPERADMIN']],
            ];
            $userRole = $authUser?->role ?? 'ADMIN';
        @endphp

        @foreach($navItems as $item)
            @if(in_array($userRole, $item['roles']))
                @php $isActive = request()->routeIs($item['route'] . '*'); @endphp
                <a
                    href="{{ route($item['route']) }}"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group
                        {{ $isActive
                            ? 'border-l-4 border-teal-400 pl-2 text-teal-400'
                            : 'text-blue-200 hover:bg-white/10 hover:text-white border-l-4 border-transparent pl-2' }}"
                    @if($isActive) style="background-color: rgba(0,168,157,0.15);" @endif
                >
                    @include('components.sidebar-icon', ['icon' => $item['icon'], 'active' => $isActive])
                    {{ $item['label'] }}
                </a>
            @endif
        @endforeach
    </nav>

    {{-- User info + Logout --}}
    <div class="px-4 py-4 border-t border-white/10">
        <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold" style="background-color: #00A89D;">
                {{ strtoupper(substr($authUser?->name ?? 'A', 0, 1)) }}
            </div>
            <div class="min-w-0">
                <p class="text-white text-sm font-medium truncate">{{ $authUser?->name ?? 'Administrador' }}</p>
                <p class="text-blue-300 text-xs truncate">{{ $authUser?->email ?? '' }}</p>
            </div>
        </div>
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button
                type="submit"
                class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Cerrar Sesión
            </button>
        </form>
    </div>
</aside>

{{-- Mobile overlay --}}
<div
    x-show="sidebarOpen"
    @click="sidebarOpen = false"
    class="fixed inset-0 bg-black/50 z-30 lg:hidden"
    x-transition:enter="transition-opacity duration-300"
    x-transition:enter-start="opacity-0"
    x-transition:enter-end="opacity-100"
    x-transition:leave="transition-opacity duration-300"
    x-transition:leave-start="opacity-100"
    x-transition:leave-end="opacity-0"
></div>
