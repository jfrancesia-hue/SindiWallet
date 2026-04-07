@extends('layouts.app')

@section('title', 'Préstamo #' . strtoupper(substr($loan->id, 0, 8)))

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        <a href="{{ route('loans.index') }}" class="hover:text-gray-700">Préstamos</a>
    </li>
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        #{{ strtoupper(substr($loan->id, 0, 8)) }}
    </li>
@endsection

@section('content')
<div class="max-w-5xl mx-auto space-y-5">

    {{-- Header --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style="background-color: #1F2B6C;">
                    {{ strtoupper(substr($loan->user?->name ?? 'U', 0, 1)) }}
                </div>
                <div>
                    <p class="text-xs text-gray-400 font-mono">{{ $loan->id }}</p>
                    <h1 class="text-xl font-bold text-gray-900">{{ $loan->user?->name }} {{ $loan->user?->last_name }}</h1>
                    <div class="flex items-center gap-2 mt-1">
                        <x-badge :type="match($loan->status) {
                            'APPROVED','ACTIVE' => 'success',
                            'PENDING'           => 'warning',
                            'PAID'              => 'info',
                            'REJECTED','DEFAULTED' => 'danger',
                            default             => 'gray'
                        }" :text="$loan->status"/>
                    </div>
                </div>
            </div>
            @if($loan->status === 'PENDING')
                <div class="flex items-center gap-2">
                    <form method="POST" action="{{ route('loans.approve', $loan->id) }}">
                        @csrf @method('PATCH')
                        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style="background-color: #00A89D;">
                            Aprobar préstamo
                        </button>
                    </form>
                    <form method="POST" action="{{ route('loans.reject', $loan->id) }}">
                        @csrf @method('PATCH')
                        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">
                            Rechazar
                        </button>
                    </form>
                </div>
            @endif
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {{-- Loan details --}}
        <div class="lg:col-span-2 space-y-5">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Condiciones del Préstamo</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    @php
                        $loanDetails = [
                            ['Monto solicitado',   '$' . number_format($loan->amount, 2, ',', '.')],
                            ['Tasa mensual',        $loan->interest_rate . '%'],
                            ['Plazo',               $loan->installments_count . ' cuotas'],
                            ['Cuota mensual',       '$' . number_format($loan->monthly_payment ?? 0, 2, ',', '.')],
                            ['Total a pagar',       '$' . number_format($loan->total_payment ?? 0, 2, ',', '.')],
                            ['Saldo pendiente',     '$' . number_format($loan->outstanding_balance ?? 0, 2, ',', '.')],
                            ['Fecha aprobación',    $loan->approved_at?->format('d/m/Y') ?? '—'],
                            ['Fecha primer pago',   $loan->first_payment_date?->format('d/m/Y') ?? '—'],
                        ];
                    @endphp
                    @foreach($loanDetails as [$label, $value])
                        <div>
                            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">{{ $label }}</p>
                            <p class="mt-0.5 text-sm font-semibold text-gray-900">{{ $value }}</p>
                        </div>
                    @endforeach
                </div>
            </div>

            {{-- Installments table --}}
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h2 class="text-base font-semibold text-gray-900">Cuadro de cuotas</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N°</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Capital</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Interés</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vencimiento</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            @forelse($loan->installments ?? [] as $inst)
                                <tr class="hover:bg-gray-50 {{ $inst->status === 'OVERDUE' ? 'bg-red-50' : '' }}">
                                    <td class="px-6 py-2.5 font-semibold text-gray-700">{{ $inst->number }}</td>
                                    <td class="px-6 py-2.5 font-semibold text-gray-900">${{ number_format($inst->amount, 2, ',', '.') }}</td>
                                    <td class="px-6 py-2.5 text-gray-600">${{ number_format($inst->principal, 2, ',', '.') }}</td>
                                    <td class="px-6 py-2.5 text-gray-600">${{ number_format($inst->interest, 2, ',', '.') }}</td>
                                    <td class="px-6 py-2.5 text-gray-500 text-xs">{{ $inst->due_date->format('d/m/Y') }}</td>
                                    <td class="px-6 py-2.5">
                                        <x-badge :type="match($inst->status) {
                                            'PAID'    => 'success',
                                            'PENDING' => 'warning',
                                            'OVERDUE' => 'danger',
                                            default   => 'gray'
                                        }" :text="match($inst->status) {
                                            'PAID'    => 'Pagado',
                                            'PENDING' => 'Pendiente',
                                            'OVERDUE' => 'Vencido',
                                            default   => $inst->status
                                        }"/>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="px-6 py-6 text-center text-gray-400 text-sm">Sin cuotas generadas</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {{-- Scoring --}}
        <div class="space-y-5">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Credit Scoring</h2>
                @if($loan->credit_score ?? false)
                    @php
                        $score = $loan->credit_score;
                        $scoreColor = $score >= 700 ? '#00A89D' : ($score >= 500 ? '#F59E0B' : '#EF4444');
                        $scoreLabel = $score >= 700 ? 'Excelente' : ($score >= 500 ? 'Regular' : 'Riesgoso');
                    @endphp
                    <div class="text-center mb-4">
                        <div class="relative inline-flex items-center justify-center w-28 h-28">
                            <svg class="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" stroke-width="10"/>
                                <circle cx="50" cy="50" r="42" fill="none" stroke="{{ $scoreColor }}" stroke-width="10"
                                    stroke-dasharray="{{ round(($score / 850) * 263.9, 1) }} 263.9"
                                    stroke-linecap="round"/>
                            </svg>
                            <div class="absolute text-center">
                                <p class="text-2xl font-bold" style="color: {{ $scoreColor }}">{{ $score }}</p>
                                <p class="text-xs text-gray-400">/ 850</p>
                            </div>
                        </div>
                        <p class="text-sm font-semibold mt-2" style="color: {{ $scoreColor }}">{{ $scoreLabel }}</p>
                    </div>
                    @if($loan->scoring_details ?? false)
                        <div class="space-y-2">
                            @foreach($loan->scoring_details as $factor => $value)
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-gray-500">{{ $factor }}</span>
                                    <span class="font-semibold text-gray-900">{{ $value }}</span>
                                </div>
                            @endforeach
                        </div>
                    @endif
                @else
                    <p class="text-sm text-gray-400 text-center py-4">Score no disponible</p>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
