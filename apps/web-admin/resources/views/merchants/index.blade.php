@extends('layouts.app')

@section('title', 'Comercios')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Comercios
    </li>
@endsection

@section('content')
<div class="space-y-5">

    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Comercios Adheridos</h1>
            <p class="text-sm text-gray-500 mt-0.5">Red de comercios con descuentos para afiliados</p>
        </div>
        <a href="{{ route('merchants.create') }}"
            class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
            style="background-color: #00A89D;">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo Comercio
        </a>
    </div>

    {{-- Search + filter --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <form method="GET" action="{{ route('merchants.index') }}" class="flex flex-wrap gap-3">
            <div class="flex-1 relative min-w-48">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Buscar comercio..."
                    class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
            <select name="category" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Todas las categorías</option>
                @foreach($categories ?? [] as $cat)
                    <option value="{{ $cat }}" {{ request('category') === $cat ? 'selected' : '' }}>{{ $cat }}</option>
                @endforeach
            </select>
            <select name="status" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Estado</option>
                <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Activo</option>
                <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Inactivo</option>
            </select>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90" style="background-color: #1F2B6C;">
                Filtrar
            </button>
        </form>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Comercio</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">CUIT</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descuento</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @forelse($merchants ?? [] as $merchant)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-3">
                                <div class="flex items-center gap-3">
                                    @if($merchant->logo_url ?? false)
                                        <img src="{{ $merchant->logo_url }}" alt="{{ $merchant->name }}" class="w-9 h-9 rounded-lg object-cover border border-gray-100 flex-shrink-0">
                                    @else
                                        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style="background-color: #F58220;">
                                            {{ strtoupper(substr($merchant->name, 0, 2)) }}
                                        </div>
                                    @endif
                                    <div>
                                        <p class="font-medium text-gray-900">{{ $merchant->name }}</p>
                                        <p class="text-xs text-gray-400">{{ $merchant->email ?? '' }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-3 font-mono text-xs text-gray-500">{{ $merchant->cuit ?? '—' }}</td>
                            <td class="px-6 py-3">
                                <x-badge type="info" :text="$merchant->category ?? 'Sin categoría'"/>
                            </td>
                            <td class="px-6 py-3 font-semibold text-gray-900">
                                {{ $merchant->discount_percentage ?? 0 }}%
                            </td>
                            <td class="px-6 py-3">
                                <x-badge :type="($merchant->is_active ?? false) ? 'success' : 'gray'" :text="($merchant->is_active ?? false) ? 'Activo' : 'Inactivo'"/>
                            </td>
                            <td class="px-6 py-3">
                                <div class="flex items-center justify-end gap-1">
                                    <a href="{{ route('merchants.edit', $merchant->id) }}"
                                        class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                        </svg>
                                    </a>
                                    <form method="POST" action="{{ route('merchants.toggle', $merchant->id) }}">
                                        @csrf @method('PATCH')
                                        <button type="submit"
                                            class="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                            title="{{ $merchant->is_active ? 'Desactivar' : 'Activar' }}">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $merchant->is_active ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }}"/>
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-gray-400">No se encontraron comercios</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if(isset($merchants) && $merchants->hasPages())
            <div class="px-6 py-4 border-t border-gray-100">{{ $merchants->withQueryString()->links() }}</div>
        @endif
    </div>
</div>
@endsection
