@extends('layouts.app')

@section('title', 'Editar Usuario')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        <a href="{{ route('users.index') }}" class="hover:text-gray-700">Usuarios</a>
    </li>
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Editar: {{ $user->name }}
    </li>
@endsection

@section('content')
<div class="max-w-3xl mx-auto space-y-5">

    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Editar Usuario</h1>
            <p class="text-sm text-gray-500 mt-0.5">{{ $user->name }} {{ $user->last_name }}</p>
        </div>
        <a href="{{ route('users.show', $user->id) }}" class="text-sm text-gray-500 hover:text-gray-700">
            Ver perfil completo →
        </a>
    </div>

    <form method="POST" action="{{ route('users.update', $user->id) }}" class="space-y-5">
        @csrf
        @method('PATCH')

        {{-- Datos personales --}}
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Datos Personales</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nombre <span class="text-red-500">*</span></label>
                    <input type="text" name="name" value="{{ old('name', $user->name) }}" required
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 @error('name') border-red-400 @enderror">
                    @error('name')<p class="mt-1 text-xs text-red-500">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Apellido <span class="text-red-500">*</span></label>
                    <input type="text" name="last_name" value="{{ old('last_name', $user->last_name) }}" required
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Email <span class="text-red-500">*</span></label>
                    <input type="email" name="email" value="{{ old('email', $user->email) }}" required
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 @error('email') border-red-400 @enderror">
                    @error('email')<p class="mt-1 text-xs text-red-500">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                    <input type="tel" name="phone" value="{{ old('phone', $user->phone) }}"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">DNI <span class="text-red-500">*</span></label>
                    <input type="text" name="dni" value="{{ old('dni', $user->dni) }}" required
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">CUIT</label>
                    <input type="text" name="cuit" value="{{ old('cuit', $user->cuit) }}"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
            </div>
        </div>

        {{-- Rol y organización --}}
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Rol y Organización</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
                    <select name="role" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                        <option value="ADMIN" {{ old('role', $user->role) === 'ADMIN' ? 'selected' : '' }}>Admin</option>
                        <option value="AFFILIATE" {{ old('role', $user->role) === 'AFFILIATE' ? 'selected' : '' }}>Afiliado</option>
                        <option value="MERCHANT" {{ old('role', $user->role) === 'MERCHANT' ? 'selected' : '' }}>Comerciante</option>
                        @if(auth()->user()?->role === 'SUPERADMIN')
                            <option value="SUPERADMIN" {{ old('role', $user->role) === 'SUPERADMIN' ? 'selected' : '' }}>Superadmin</option>
                        @endif
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Empleador</label>
                    <input type="text" name="employer" value="{{ old('employer', $user->employer) }}"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">CUIT Empleador</label>
                    <input type="text" name="employer_cuit" value="{{ old('employer_cuit', $user->employer_cuit) }}"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Salario</label>
                    <div class="relative">
                        <span class="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                        <input type="number" name="salary" value="{{ old('salary', $user->salary) }}" step="0.01"
                            class="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha de Afiliación</label>
                    <input type="date" name="affiliation_date" value="{{ old('affiliation_date', $user->affiliation_date?->format('Y-m-d')) }}"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
            </div>
        </div>

        {{-- KYC Status --}}
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Estado KYC</h2>
            <div class="flex items-center gap-4">
                <div class="flex-1">
                    <p class="text-sm text-gray-600 mb-1">Estado actual:</p>
                    <x-badge :type="match($user->kyc_status ?? 'PENDING') {
                        'APPROVED' => 'success',
                        'PENDING'  => 'warning',
                        'REJECTED' => 'danger',
                        default    => 'gray'
                    }" :text="$user->kyc_status ?? 'PENDING'"/>
                </div>
                <div class="flex items-center gap-2">
                    @if(($user->kyc_status ?? 'PENDING') !== 'APPROVED')
                        <form method="POST" action="{{ route('users.kyc.approve', $user->id) }}">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style="background-color: #00A89D;">
                                Aprobar KYC
                            </button>
                        </form>
                    @endif
                    @if(($user->kyc_status ?? 'PENDING') !== 'REJECTED')
                        <form method="POST" action="{{ route('users.kyc.reject', $user->id) }}">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">
                                Rechazar KYC
                            </button>
                        </form>
                    @endif
                </div>
            </div>
        </div>

        {{-- Actions --}}
        <div class="flex items-center justify-end gap-3">
            <a href="{{ route('users.index') }}" class="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
            </a>
            <button type="submit" class="px-6 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style="background-color: #00A89D;">
                Guardar Cambios
            </button>
        </div>
    </form>
</div>
@endsection
