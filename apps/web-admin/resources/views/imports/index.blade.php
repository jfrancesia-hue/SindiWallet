@extends('layouts.app')

@section('title', 'Importaciones')

@section('content')
<div class="flex justify-between items-center mb-6">
    <div>
        <h1 class="text-2xl font-bold text-gray-900">Importaciones Masivas</h1>
        <p class="text-gray-500 mt-1">Subí archivos CSV para cargar afiliados, cuotas o comercios</p>
    </div>
    <a href="{{ route('imports.create') }}" class="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600">
        + Nueva Importación
    </a>
</div>

@if(session('success'))
<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
    {{ session('success') }}
</div>
@endif

<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b">
            <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Archivo</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Tipo</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Filas</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Errores</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500"></th>
            </tr>
        </thead>
        <tbody class="divide-y">
            @forelse($imports as $import)
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-700">{{ $import['fileName'] }}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {{ $import['type'] }}
                    </span>
                </td>
                <td class="px-4 py-3">
                    @php
                        $statusColors = [
                            'PENDING' => 'bg-yellow-100 text-yellow-700',
                            'PROCESSING' => 'bg-blue-100 text-blue-700',
                            'COMPLETED' => 'bg-green-100 text-green-700',
                            'FAILED' => 'bg-red-100 text-red-700',
                        ];
                        $color = $statusColors[$import['status']] ?? 'bg-gray-100 text-gray-700';
                    @endphp
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {{ $color }}">
                        {{ $import['status'] }}
                    </span>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ $import['processedRows'] }}/{{ $import['totalRows'] }}</td>
                <td class="px-4 py-3">
                    @if($import['errorRows'] > 0)
                        <span class="text-red-600 font-medium">{{ $import['errorRows'] }}</span>
                    @else
                        <span class="text-gray-400">0</span>
                    @endif
                </td>
                <td class="px-4 py-3 text-gray-500 text-xs">{{ \Carbon\Carbon::parse($import['createdAt'])->format('d/m/Y H:i') }}</td>
                <td class="px-4 py-3">
                    <a href="{{ route('imports.show', $import['id']) }}" class="text-teal-600 hover:text-teal-800 text-xs font-medium">Ver detalle</a>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-400">No hay importaciones registradas</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
