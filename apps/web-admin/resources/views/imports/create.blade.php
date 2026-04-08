@extends('layouts.app')

@section('title', 'Nueva Importación')

@section('content')
<div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Nueva Importación</h1>
    <p class="text-gray-500 mt-1">Subí un archivo CSV para importar datos masivamente</p>
</div>

<div class="max-w-xl">
    <form method="POST" action="{{ route('imports.store') }}" enctype="multipart/form-data" class="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        @csrf

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de importación</label>
            <select name="type" required class="w-full rounded-lg border-gray-300">
                <option value="">Seleccioná un tipo...</option>
                <option value="USERS">Afiliados (usuarios)</option>
                <option value="DUES">Pagos de cuotas</option>
                <option value="MERCHANTS">Comercios</option>
            </select>
            @error('type')
                <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
            @enderror
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Archivo CSV</label>
            <input type="file" name="file" accept=".csv,.txt" required
                class="w-full border border-gray-300 rounded-lg p-2 text-sm">
            @error('file')
                <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
            @enderror
            <p class="text-gray-400 text-xs mt-2">Máximo 5MB. Formato CSV con headers en la primera fila.</p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
            <p class="font-medium mb-2">Formato esperado por tipo:</p>
            <ul class="space-y-1">
                <li><strong>USERS:</strong> email, nombre, apellido, dni, telefono, cuit, salario</li>
                <li><strong>DUES:</strong> user_dni, due_name, period, amount</li>
                <li><strong>MERCHANTS:</strong> user_dni, razon_social, cuit, categoria, direccion, descuento</li>
            </ul>
        </div>

        <div class="flex gap-3">
            <button type="submit" class="bg-teal-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-600">
                Importar
            </button>
            <a href="{{ route('imports.index') }}" class="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                Cancelar
            </a>
        </div>
    </form>
</div>
@endsection
