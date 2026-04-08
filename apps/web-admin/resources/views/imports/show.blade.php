@extends('layouts.app')

@section('title', 'Detalle de Importación')

@section('content')
<div class="mb-6">
    <a href="{{ route('imports.index') }}" class="text-teal-600 hover:text-teal-800 text-sm">&larr; Volver a importaciones</a>
    <h1 class="text-2xl font-bold text-gray-900 mt-2">Detalle de Importación</h1>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="bg-white rounded-xl shadow-sm border p-4">
        <p class="text-xs text-gray-500">Archivo</p>
        <p class="text-lg font-semibold">{{ $import['fileName'] ?? '-' }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm border p-4">
        <p class="text-xs text-gray-500">Estado</p>
        <p class="text-lg font-semibold">{{ $import['status'] ?? '-' }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm border p-4">
        <p class="text-xs text-gray-500">Progreso</p>
        <p class="text-lg font-semibold">{{ $import['processedRows'] ?? 0 }}/{{ $import['totalRows'] ?? 0 }} filas</p>
        @if(($import['errorRows'] ?? 0) > 0)
            <p class="text-red-500 text-xs mt-1">{{ $import['errorRows'] }} errores</p>
        @endif
    </div>
</div>

@if(!empty($import['errors']))
<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
    <div class="px-4 py-3 bg-red-50 border-b">
        <h3 class="font-medium text-red-700">Errores encontrados</h3>
    </div>
    <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b">
            <tr>
                <th class="text-left px-4 py-2 font-medium text-gray-500">Fila</th>
                <th class="text-left px-4 py-2 font-medium text-gray-500">Error</th>
            </tr>
        </thead>
        <tbody class="divide-y">
            @foreach($import['errors'] as $error)
            <tr>
                <td class="px-4 py-2 text-gray-600">{{ $error['row'] ?? '-' }}</td>
                <td class="px-4 py-2 text-red-600">{{ $error['error'] ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif
@endsection
