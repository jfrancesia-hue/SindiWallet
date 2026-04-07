@extends('layouts.app')

@section('title', 'Beneficios')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Beneficios
    </li>
@endsection

@section('content')
<div class="space-y-5">

    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Beneficios</h1>
            <p class="text-sm text-gray-500 mt-0.5">Catálogo de beneficios disponibles para afiliados</p>
        </div>
        <div class="flex items-center gap-2">
            <a href="{{ route('benefits.requests') }}" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cola de solicitudes
                @if(($pendingRequests ?? 0) > 0)
                    <span class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">{{ $pendingRequests }}</span>
                @endif
            </a>
            <a href="{{ route('benefits.create') }}"
                class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
                style="background-color: #00A89D;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nuevo Beneficio
            </a>
        </div>
    </div>

    {{-- Grid of benefits --}}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @forelse($benefits ?? [] as $benefit)
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div class="h-2 w-full" style="background-color: {{ $benefit->is_active ? '#00A89D' : '#9CA3AF' }}"></div>
                <div class="p-5">
                    <div class="flex items-start justify-between mb-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background-color: rgba(0,168,157,0.1);">
                            <svg class="w-5 h-5" style="color: #00A89D;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                            </svg>
                        </div>
                        <x-badge :type="$benefit->is_active ? 'success' : 'gray'" :text="$benefit->is_active ? 'Activo' : 'Inactivo'"/>
                    </div>

                    <h3 class="font-semibold text-gray-900 mb-1">{{ $benefit->name }}</h3>
                    <p class="text-xs text-gray-500 mb-3">{{ $benefit->category ?? 'Sin categoría' }}</p>

                    <div class="flex items-center justify-between">
                        <p class="text-lg font-bold text-gray-900">${{ number_format($benefit->amount ?? 0, 0, ',', '.') }}</p>
                        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href="{{ route('benefits.edit', $benefit->id) }}"
                                class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                            </a>
                            <form method="POST" action="{{ route('benefits.toggle', $benefit->id) }}">
                                @csrf @method('PATCH')
                                <button type="submit" class="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="{{ $benefit->is_active ? 'Desactivar' : 'Activar' }}">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $benefit->is_active ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }}"/>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-span-full bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <svg class="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                </svg>
                <p class="text-gray-500 font-medium">No hay beneficios configurados</p>
                <a href="{{ route('benefits.create') }}" class="inline-flex mt-3 text-sm font-medium hover:underline" style="color: #00A89D;">
                    Crear primer beneficio →
                </a>
            </div>
        @endforelse
    </div>
</div>
@endsection
