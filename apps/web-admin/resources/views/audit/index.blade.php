@extends('layouts.app')

@section('title', 'Audit Log')

@section('content')
<div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Registro de Auditoría</h1>
    <p class="text-gray-500 mt-1">Historial de acciones realizadas en el sistema</p>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-sm border p-4 mb-6">
    <form method="GET" action="{{ route('audit.index') }}" class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Entidad</label>
            <select name="entity" class="w-full rounded-lg border-gray-300 text-sm">
                <option value="">Todas</option>
                @foreach(['User', 'Transaction', 'Loan', 'BenefitRequest', 'Due', 'Merchant', 'Wallet'] as $e)
                    <option value="{{ $e }}" {{ ($filters['entity'] ?? '') === $e ? 'selected' : '' }}>{{ $e }}</option>
                @endforeach
            </select>
        </div>
        <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Acción</label>
            <input type="text" name="action" value="{{ $filters['action'] ?? '' }}" placeholder="POST create..." class="w-full rounded-lg border-gray-300 text-sm">
        </div>
        <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Desde</label>
            <input type="date" name="dateFrom" value="{{ $filters['dateFrom'] ?? '' }}" class="w-full rounded-lg border-gray-300 text-sm">
        </div>
        <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
            <input type="date" name="dateTo" value="{{ $filters['dateTo'] ?? '' }}" class="w-full rounded-lg border-gray-300 text-sm">
        </div>
        <div class="flex items-end">
            <button type="submit" class="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 w-full">Filtrar</button>
        </div>
    </form>
</div>

<!-- Table -->
<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b">
            <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Usuario</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Acción</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Entidad</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">ID Entidad</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">IP</th>
            </tr>
        </thead>
        <tbody class="divide-y">
            @forelse($logs as $log)
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-600">{{ \Carbon\Carbon::parse($log['createdAt'])->format('d/m/Y H:i') }}</td>
                <td class="px-4 py-3">
                    @if($log['user'] ?? null)
                        <span class="font-medium">{{ $log['user']['firstName'] }} {{ $log['user']['lastName'] }}</span>
                    @else
                        <span class="text-gray-400">Sistema</span>
                    @endif
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                        {{ str_contains($log['action'], 'POST') ? 'bg-green-100 text-green-700' : '' }}
                        {{ str_contains($log['action'], 'PATCH') ? 'bg-blue-100 text-blue-700' : '' }}
                        {{ str_contains($log['action'], 'DELETE') ? 'bg-red-100 text-red-700' : '' }}
                    ">
                        {{ $log['action'] }}
                    </span>
                </td>
                <td class="px-4 py-3 font-medium text-gray-700">{{ $log['entity'] }}</td>
                <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ \Illuminate\Support\Str::limit($log['entityId'] ?? '-', 12) }}</td>
                <td class="px-4 py-3 text-gray-400 text-xs">{{ $log['ipAddress'] ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="px-4 py-8 text-center text-gray-400">No hay registros de auditoría</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if(($meta['totalPages'] ?? 1) > 1)
<div class="mt-4 flex justify-center">
    <span class="text-sm text-gray-500">
        Página {{ $meta['page'] ?? 1 }} de {{ $meta['totalPages'] ?? 1 }} — {{ $meta['total'] ?? 0 }} registros
    </span>
</div>
@endif
@endsection
