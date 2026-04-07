@extends('layouts.app')

@section('title', 'Conciliación Art. 38')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        <a href="{{ route('dues.index') }}" class="hover:text-gray-700">Cuotas</a>
    </li>
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Conciliación
    </li>
@endsection

@section('content')
<div class="max-w-4xl mx-auto space-y-5">

    <div>
        <h1 class="text-2xl font-bold text-gray-900">Conciliación de Retenciones</h1>
        <p class="text-sm text-gray-500 mt-0.5">Procesamiento de retenciones Art. 38 — Ley de Obras Sociales</p>
    </div>

    {{-- Upload form --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 class="text-base font-semibold text-gray-900 mb-4">Cargar archivo de retenciones</h2>
        <form
            method="POST"
            action="{{ route('dues.reconciliation.process') }}"
            enctype="multipart/form-data"
            x-data="{ dragging: false, fileName: '' }"
        >
            @csrf

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Período</label>
                    <div class="flex gap-2">
                        <select name="month" class="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                            @for($m = 1; $m <= 12; $m++)
                                <option value="{{ $m }}" {{ now()->month == $m ? 'selected' : '' }}>
                                    {{ \Carbon\Carbon::create(null, $m, 1)->isoFormat('MMMM') }}
                                </option>
                            @endfor
                        </select>
                        <select name="year" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                            @for($y = now()->year; $y >= now()->year - 2; $y--)
                                <option value="{{ $y }}">{{ $y }}</option>
                            @endfor
                        </select>
                    </div>
                </div>
            </div>

            <div
                class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
                :class="dragging ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-gray-400'"
                @dragover.prevent="dragging = true"
                @dragleave.prevent="dragging = false"
                @drop.prevent="dragging = false; fileName = $event.dataTransfer.files[0]?.name; $refs.file.files = $event.dataTransfer.files"
                @click="$refs.file.click()"
            >
                <svg class="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p class="text-sm font-medium text-gray-700" x-text="fileName || 'Arrastrá el CSV de retenciones'"></p>
                <p class="text-xs text-gray-400 mt-1" x-show="!fileName">Formato Art. 38 — CUIT, DNI, Monto</p>
                <input type="file" name="retention_file" accept=".csv,.txt" x-ref="file" @change="fileName = $event.target.files[0]?.name" class="hidden">
            </div>

            <button type="submit" :disabled="!fileName"
                class="mt-4 w-full py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style="background-color: #1F2B6C;">
                Procesar conciliación
            </button>
        </form>
    </div>

    {{-- Results --}}
    @if(isset($reconciliationResults))
        <div class="grid grid-cols-3 gap-4">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
                <p class="text-3xl font-bold" style="color: #00A89D;">{{ $reconciliationResults['matched'] ?? 0 }}</p>
                <p class="text-sm text-gray-500 mt-1">Matcheados</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
                <p class="text-3xl font-bold text-red-500">{{ $reconciliationResults['not_found'] ?? 0 }}</p>
                <p class="text-sm text-gray-500 mt-1">No encontrados</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
                <p class="text-3xl font-bold text-yellow-500">{{ $reconciliationResults['differences'] ?? 0 }}</p>
                <p class="text-sm text-gray-500 mt-1">Con diferencias</p>
            </div>
        </div>

        {{-- Detail table --}}
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100">
                <h2 class="text-base font-semibold text-gray-900">Detalle de conciliación</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">DNI/CUIT</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Afiliado</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto CSV</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto Sistema</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Diferencia</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Resultado</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        @forelse($reconciliationResults['details'] ?? [] as $row)
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-3 font-mono text-xs text-gray-600">{{ $row['identifier'] }}</td>
                                <td class="px-6 py-3 text-gray-900">{{ $row['user_name'] ?? '—' }}</td>
                                <td class="px-6 py-3 font-semibold">${{ number_format($row['csv_amount'] ?? 0, 2, ',', '.') }}</td>
                                <td class="px-6 py-3 font-semibold">${{ number_format($row['system_amount'] ?? 0, 2, ',', '.') }}</td>
                                <td class="px-6 py-3 font-semibold {{ ($row['difference'] ?? 0) != 0 ? 'text-red-600' : 'text-gray-400' }}">
                                    {{ ($row['difference'] ?? 0) != 0 ? '$' . number_format(abs($row['difference']), 2, ',', '.') : '—' }}
                                </td>
                                <td class="px-6 py-3">
                                    <x-badge :type="match($row['result'] ?? '') {
                                        'MATCHED'    => 'success',
                                        'NOT_FOUND'  => 'danger',
                                        'DIFFERENCE' => 'warning',
                                        default      => 'gray'
                                    }" :text="match($row['result'] ?? '') {
                                        'MATCHED'    => 'Matcheado',
                                        'NOT_FOUND'  => 'No encontrado',
                                        'DIFFERENCE' => 'Diferencia',
                                        default      => '—'
                                    }"/>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="px-6 py-8 text-center text-gray-400">Sin resultados</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    @endif
</div>
@endsection
