@extends('layouts.app')

@section('title', 'Cuotas')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Cuotas
    </li>
@endsection

@section('content')
<div class="space-y-5">

    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Cuotas</h1>
            <p class="text-sm text-gray-500 mt-0.5">Tipos de cuotas configuradas para la organización</p>
        </div>
        <div class="flex items-center gap-2">
            <a href="{{ route('dues.payments') }}" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Historial de pagos
            </a>
            <a href="{{ route('dues.reconciliation') }}" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Conciliación
            </a>
            <a href="{{ route('dues.create') }}"
                class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
                style="background-color: #00A89D;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nueva Cuota
            </a>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto fijo</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">% Salario</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Frecuencia</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @forelse($dues ?? [] as $due)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-3">
                                <p class="font-medium text-gray-900">{{ $due->name }}</p>
                                <p class="text-xs text-gray-400 mt-0.5">{{ $due->description ?? '' }}</p>
                            </td>
                            <td class="px-6 py-3 font-semibold text-gray-900">
                                {{ $due->fixed_amount ? '$' . number_format($due->fixed_amount, 2, ',', '.') : '—' }}
                            </td>
                            <td class="px-6 py-3 text-gray-700">
                                {{ $due->salary_percentage ? $due->salary_percentage . '%' : '—' }}
                            </td>
                            <td class="px-6 py-3">
                                <x-badge type="info" :text="$due->frequency ?? 'MONTHLY'"/>
                            </td>
                            <td class="px-6 py-3">
                                <x-badge :type="($due->is_active ?? false) ? 'success' : 'gray'" :text="($due->is_active ?? false) ? 'Activa' : 'Inactiva'"/>
                            </td>
                            <td class="px-6 py-3">
                                <div class="flex items-center justify-end gap-1">
                                    <a href="{{ route('dues.edit', $due->id) }}"
                                        class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                        </svg>
                                    </a>
                                    <form method="POST" action="{{ route('dues.destroy', $due->id) }}" onsubmit="return confirm('¿Eliminar esta cuota?')">
                                        @csrf @method('DELETE')
                                        <button type="submit" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-gray-400">No hay cuotas configuradas</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
