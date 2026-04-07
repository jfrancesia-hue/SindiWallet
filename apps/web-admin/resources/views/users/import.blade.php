@extends('layouts.app')

@section('title', 'Importar Usuarios')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        <a href="{{ route('users.index') }}" class="hover:text-gray-700">Usuarios</a>
    </li>
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Importar CSV
    </li>
@endsection

@section('content')
<div class="max-w-3xl mx-auto space-y-5">

    <div>
        <h1 class="text-2xl font-bold text-gray-900">Importar Usuarios</h1>
        <p class="text-sm text-gray-500 mt-0.5">Cargá un archivo CSV para importar afiliados en lote</p>
    </div>

    {{-- Upload form --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form
            method="POST"
            action="{{ route('users.import.process') }}"
            enctype="multipart/form-data"
            x-data="csvImport()"
        >
            @csrf

            {{-- Drag & drop zone --}}
            <div
                class="border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer"
                :class="dragging ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-gray-400'"
                @dragover.prevent="dragging = true"
                @dragleave.prevent="dragging = false"
                @drop.prevent="handleDrop($event)"
                @click="$refs.fileInput.click()"
            >
                <svg class="w-12 h-12 mx-auto mb-4" :class="dragging ? 'text-teal-400' : 'text-gray-300'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p class="text-base font-medium text-gray-700" x-text="fileName || 'Arrastrá tu archivo CSV aquí'"></p>
                <p class="text-sm text-gray-400 mt-1" x-show="!fileName">o hacé click para seleccionar</p>
                <p class="text-sm text-teal-600 mt-1 font-medium" x-show="fileName">Archivo seleccionado</p>
                <input
                    type="file"
                    name="csv_file"
                    accept=".csv,.txt"
                    x-ref="fileInput"
                    @change="handleFileChange($event)"
                    class="hidden"
                >
            </div>

            <button
                type="submit"
                :disabled="!fileName"
                class="mt-4 w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style="background-color: #00A89D;"
            >
                Procesar importación
            </button>
        </form>
    </div>

    {{-- Column guide --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 class="text-base font-semibold text-gray-900 mb-4">Columnas requeridas</h2>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Columna</th>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Requerido</th>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Descripción</th>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Ejemplo</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @php
                        $columns = [
                            ['name', 'Sí', 'Nombre del afiliado', 'Juan'],
                            ['last_name', 'Sí', 'Apellido', 'Pérez'],
                            ['email', 'Sí', 'Correo electrónico único', 'juan@ejemplo.com'],
                            ['dni', 'Sí', 'DNI sin puntos', '28456789'],
                            ['cuit', 'No', 'CUIT con guiones', '20-28456789-3'],
                            ['phone', 'No', 'Teléfono con código de área', '+54911234567'],
                            ['employer', 'No', 'Nombre del empleador', 'Empresa SA'],
                            ['employer_cuit', 'No', 'CUIT del empleador', '30-12345678-9'],
                            ['salary', 'No', 'Salario bruto en ARS', '150000'],
                            ['affiliation_date', 'No', 'Fecha (YYYY-MM-DD)', '2024-01-15'],
                        ];
                    @endphp
                    @foreach($columns as [$col, $req, $desc, $example])
                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-2 font-mono text-xs text-gray-900 font-semibold">{{ $col }}</td>
                            <td class="px-4 py-2">
                                @if($req === 'Sí')
                                    <x-badge type="danger" text="Requerido"/>
                                @else
                                    <x-badge type="gray" text="Opcional"/>
                                @endif
                            </td>
                            <td class="px-4 py-2 text-gray-600">{{ $desc }}</td>
                            <td class="px-4 py-2 font-mono text-xs text-gray-500">{{ $example }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    {{-- Import results --}}
    @if(isset($importResults))
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">Resultado de importación</h2>
            <div class="grid grid-cols-3 gap-4 mb-5">
                <div class="text-center p-4 bg-teal-50 rounded-xl">
                    <p class="text-3xl font-bold text-teal-700">{{ $importResults['processed'] ?? 0 }}</p>
                    <p class="text-sm text-teal-600 mt-1">Procesados</p>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-xl">
                    <p class="text-3xl font-bold text-green-700">{{ $importResults['success'] ?? 0 }}</p>
                    <p class="text-sm text-green-600 mt-1">Exitosos</p>
                </div>
                <div class="text-center p-4 bg-red-50 rounded-xl">
                    <p class="text-3xl font-bold text-red-700">{{ $importResults['errors'] ?? 0 }}</p>
                    <p class="text-sm text-red-600 mt-1">Errores</p>
                </div>
            </div>

            @if(isset($importResults['error_details']) && count($importResults['error_details']) > 0)
                <h3 class="text-sm font-semibold text-red-700 mb-2">Filas con errores:</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-red-50">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-red-600 uppercase">Fila</th>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-red-600 uppercase">Email</th>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-red-600 uppercase">Error</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-red-50">
                            @foreach($importResults['error_details'] as $err)
                                <tr>
                                    <td class="px-4 py-2 text-gray-600">{{ $err['row'] }}</td>
                                    <td class="px-4 py-2 text-gray-600">{{ $err['email'] ?? '—' }}</td>
                                    <td class="px-4 py-2 text-red-600">{{ $err['message'] }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </div>
    @endif
</div>

<script>
function csvImport() {
    return {
        dragging: false,
        fileName: '',
        handleDrop(event) {
            this.dragging = false;
            const file = event.dataTransfer.files[0];
            if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
                this.fileName = file.name;
                const dt = new DataTransfer();
                dt.items.add(file);
                this.$refs.fileInput.files = dt.files;
            }
        },
        handleFileChange(event) {
            this.fileName = event.target.files[0]?.name || '';
        }
    };
}
</script>
@endsection
