@extends('layouts.app')

@section('title', 'Préstamos')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Préstamos
    </li>
@endsection

@section('content')
<div class="space-y-5" x-data="{ activeTab: '{{ request('tab', 'all') }}' }">

    <div>
        <h1 class="text-2xl font-bold text-gray-900">Préstamos</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestión de préstamos y financiaciones a afiliados</p>
    </div>

    {{-- Tabs --}}
    <div class="flex border-b border-gray-200">
        @php
            $tabs = [
                'all'      => ['label' => 'Todos',     'count' => $counts['all'] ?? 0],
                'pending'  => ['label' => 'Pendientes', 'count' => $counts['pending'] ?? 0],
                'active'   => ['label' => 'Activos',   'count' => $counts['active'] ?? 0],
                'paid'     => ['label' => 'Pagados',   'count' => $counts['paid'] ?? 0],
                'rejected' => ['label' => 'Rechazados','count' => $counts['rejected'] ?? 0],
            ];
        @endphp
        @foreach($tabs as $key => $tab)
            <button
                @click="activeTab = '{{ $key }}'"
                :class="activeTab === '{{ $key }}'
                    ? 'border-b-2 text-teal-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'"
                class="px-5 py-3 text-sm transition-colors flex items-center gap-2"
                style="border-color: {{ 'currentColor' }}"
                :style="activeTab === '{{ $key }}' ? 'border-color: #00A89D' : ''"
            >
                {{ $tab['label'] }}
                @if($tab['count'] > 0)
                    <span class="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        :class="activeTab === '{{ $key }}' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'">
                        {{ $tab['count'] }}
                    </span>
                @endif
            </button>
        @endforeach
    </div>

    {{-- Table --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Afiliado</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cuotas</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tasa</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Score</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Detalle</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @forelse($loans ?? [] as $loan)
                        <tr
                            class="hover:bg-gray-50 transition-colors"
                            x-show="activeTab === 'all' || activeTab === '{{ strtolower($loan->status) }}'"
                        >
                            <td class="px-6 py-3">
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style="background-color: #1F2B6C;">
                                        {{ strtoupper(substr($loan->user?->name ?? 'U', 0, 1)) }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-900">{{ $loan->user?->name }} {{ $loan->user?->last_name }}</p>
                                        <p class="text-xs text-gray-400">{{ $loan->user?->dni }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-3 font-semibold text-gray-900">${{ number_format($loan->amount, 0, ',', '.') }}</td>
                            <td class="px-6 py-3 text-gray-700">{{ $loan->installments_count }}x</td>
                            <td class="px-6 py-3 text-gray-700">{{ $loan->interest_rate }}%</td>
                            <td class="px-6 py-3">
                                <x-badge :type="match($loan->status) {
                                    'APPROVED','ACTIVE' => 'success',
                                    'PENDING'           => 'warning',
                                    'PAID'              => 'info',
                                    'REJECTED','DEFAULTED' => 'danger',
                                    default             => 'gray'
                                }" :text="match($loan->status) {
                                    'PENDING'  => 'Pendiente',
                                    'APPROVED' => 'Aprobado',
                                    'ACTIVE'   => 'Activo',
                                    'PAID'     => 'Pagado',
                                    'REJECTED' => 'Rechazado',
                                    'DEFAULTED'=> 'En mora',
                                    default    => $loan->status
                                }"/>
                            </td>
                            <td class="px-6 py-3">
                                @if($loan->credit_score ?? false)
                                    <div class="flex items-center gap-2">
                                        <div class="flex-1 h-1.5 bg-gray-200 rounded-full w-16">
                                            <div class="h-1.5 rounded-full {{ $loan->credit_score >= 700 ? 'bg-teal-500' : ($loan->credit_score >= 500 ? 'bg-yellow-400' : 'bg-red-400') }}"
                                                style="width: {{ min(100, ($loan->credit_score / 850) * 100) }}%">
                                            </div>
                                        </div>
                                        <span class="text-xs font-semibold {{ $loan->credit_score >= 700 ? 'text-teal-600' : ($loan->credit_score >= 500 ? 'text-yellow-600' : 'text-red-500') }}">
                                            {{ $loan->credit_score }}
                                        </span>
                                    </div>
                                @else
                                    <span class="text-gray-400 text-xs">—</span>
                                @endif
                            </td>
                            <td class="px-6 py-3 text-gray-500 text-xs">{{ $loan->created_at->format('d/m/Y') }}</td>
                            <td class="px-6 py-3 text-right">
                                <a href="{{ route('loans.show', $loan->id) }}"
                                    class="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg inline-flex transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="px-6 py-12 text-center text-gray-400">No se encontraron préstamos</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if(isset($loans) && $loans->hasPages())
            <div class="px-6 py-4 border-t border-gray-100">{{ $loans->links() }}</div>
        @endif
    </div>
</div>
@endsection
