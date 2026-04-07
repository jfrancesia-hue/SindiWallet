@extends('layouts.app')

@section('title', 'Usuarios')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Usuarios
    </li>
@endsection

@section('content')
<div class="space-y-5" x-data="{ confirmDeactivate: false, deactivateUserId: null, deactivateUserName: '' }">

    {{-- Header --}}
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Usuarios</h1>
            <p class="text-sm text-gray-500 mt-0.5">Gestión de afiliados, administradores y comerciantes</p>
        </div>
        <div class="flex items-center gap-2">
            <a
                href="{{ route('users.import') }}"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                Importar CSV
            </a>
            <a
                href="{{ route('users.create') }}"
                class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
                style="background-color: #00A89D;"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nuevo Usuario
            </a>
        </div>
    </div>

    {{-- Filters --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <form method="GET" action="{{ route('users.index') }}" class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 relative">
                <input
                    type="text"
                    name="search"
                    value="{{ request('search') }}"
                    placeholder="Buscar por nombre, email o DNI..."
                    class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
            <select name="role" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Todos los roles</option>
                <option value="SUPERADMIN" {{ request('role') === 'SUPERADMIN' ? 'selected' : '' }}>Superadmin</option>
                <option value="ADMIN" {{ request('role') === 'ADMIN' ? 'selected' : '' }}>Admin</option>
                <option value="AFFILIATE" {{ request('role') === 'AFFILIATE' ? 'selected' : '' }}>Afiliado</option>
                <option value="MERCHANT" {{ request('role') === 'MERCHANT' ? 'selected' : '' }}>Comerciante</option>
            </select>
            <select name="status" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Todos los estados</option>
                <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Activo</option>
                <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Inactivo</option>
            </select>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90" style="background-color: #1F2B6C;">
                Filtrar
            </button>
            @if(request()->hasAny(['search','role','status']))
                <a href="{{ route('users.index') }}" class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Limpiar
                </a>
            @endif
        </form>
    </div>

    {{-- Table --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">DNI</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registro</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @forelse($users ?? [] as $user)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0" style="background-color: #1F2B6C;">
                                        {{ strtoupper(substr($user->name, 0, 1)) }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-900">{{ $user->name }}</p>
                                        <p class="text-xs text-gray-500">{{ $user->last_name ?? '' }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-3 text-gray-600">{{ $user->email }}</td>
                            <td class="px-6 py-3 text-gray-600 font-mono text-xs">{{ $user->dni ?? '—' }}</td>
                            <td class="px-6 py-3">
                                <x-badge :type="match($user->role) {
                                    'SUPERADMIN' => 'purple',
                                    'ADMIN'      => 'navy',
                                    'AFFILIATE'  => 'teal',
                                    'MERCHANT'   => 'accent',
                                    default      => 'gray'
                                }" :text="$user->role"/>
                            </td>
                            <td class="px-6 py-3">
                                <x-badge :type="match($user->kyc_status ?? 'PENDING') {
                                    'APPROVED' => 'success',
                                    'PENDING'  => 'warning',
                                    'REJECTED' => 'danger',
                                    default    => 'gray'
                                }" :text="$user->kyc_status ?? 'PENDING'"/>
                            </td>
                            <td class="px-6 py-3 text-gray-500 text-xs">{{ $user->created_at->format('d/m/Y') }}</td>
                            <td class="px-6 py-3">
                                <div class="flex items-center justify-end gap-1">
                                    <a href="{{ route('users.show', $user->id) }}" class="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Ver">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    </a>
                                    <a href="{{ route('users.edit', $user->id) }}" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                        </svg>
                                    </a>
                                    <button
                                        @click="deactivateUserId = {{ $user->id }}; deactivateUserName = '{{ addslashes($user->name) }}'; confirmDeactivate = true"
                                        class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="{{ $user->is_active ? 'Desactivar' : 'Activar' }}"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $user->is_active ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }}"/>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                                <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                                </svg>
                                No se encontraron usuarios
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if(isset($users) && $users->hasPages())
            <div class="px-6 py-4 border-t border-gray-100">
                {{ $users->withQueryString()->links() }}
            </div>
        @endif
    </div>

    {{-- Confirm deactivate modal --}}
    <div
        x-show="confirmDeactivate"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="display: none;"
    >
        <div class="absolute inset-0 bg-gray-900/60" @click="confirmDeactivate = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">¿Desactivar usuario?</h3>
            <p class="text-sm text-gray-500 mb-6">Esta acción desactivará a <span class="font-semibold text-gray-900" x-text="deactivateUserName"></span>. Podrás reactivarlo en cualquier momento.</p>
            <div class="flex gap-3">
                <button @click="confirmDeactivate = false" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Cancelar
                </button>
                <form :action="`/users/${deactivateUserId}/toggle`" method="POST" class="flex-1">
                    @csrf
                    @method('PATCH')
                    <button type="submit" class="w-full px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">
                        Desactivar
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
