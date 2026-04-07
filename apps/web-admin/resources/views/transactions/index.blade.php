@extends('layouts.app')

@section('title', 'Transacciones')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Transacciones
    </li>
@endsection

@section('content')
<div class="space-y-5">

    <div>
        <h1 class="text-2xl font-bold text-gray-900">Transacciones</h1>
        <p class="text-sm text-gray-500 mt-0.5">Historial completo de movimientos de la plataforma</p>
    </div>

    {{-- Filters --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <form method="GET" action="{{ route('transactions.index') }}"
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

            <select name="type" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white col-span-1">
                <option value="">Tipo</option>
                @foreach(['TRANSFER','PAYMENT','DEPOSIT','WITHDRAWAL','LOAN_DISBURSEMENT','LOAN_REPAYMENT','DUE_PAYMENT','BENEFIT'] as $type)
                    <option value="{{ $type }}" {{ request('type') === $type ? 'selected' : '' }}>{{ $type }}</option>
                @endforeach
            </select>

            <select name="status" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Estado</option>
                @foreach(['PENDING','COMPLETED','FAILED','REVERSED'] as $status)
                    <option value="{{ $status }}" {{ request('status') === $status ? 'selected' : '' }}>{{ $status }}</option>
                @endforeach
            </select>

            <div class="relative">
                <input type="date" name="date_from" value="{{ request('date_from') }}"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            </div>

            <div class="relative">
                <input type="date" name="date_to" value="{{ request('date_to') }}"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            </div>

            <div class="relative">
                <span class="absolute left-3 top-2.5 text-gray-400 text-xs">$</span>
                <input type="number" name="amount_min" value="{{ request('amount_min') }}" placeholder="Monto mín."
                    class="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            </div>

            <div class="flex gap-2">
                <div class="relative flex-1">
                    <span class="absolute left-3 top-2.5 text-gray-400 text-xs">$</span>
                    <input type="number" name="amount_max" value="{{ request('amount_max') }}" placeholder="Máx."
                        class="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
                <button type="submit" class="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 flex-shrink-0" style="background-color: #1F2B6C;">
                    Filtrar
                </button>
            </div>

            @if(request()->hasAny(['type','status','date_from','date_to','amount_min','amount_max']))
                <a href="{{ route('transactions.index') }}" class="col-span-full text-sm text-gray-500 hover:text-gray-700 text-right">
                    Limpiar filtros
                </a>
            @endif
        </form>
    </div>

    {{-- Table --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">De → Para</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Detalle</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @forelse($transactions ?? [] as $tx)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-3 font-mono text-xs text-gray-500">
                                #{{ strtoupper(substr($tx->id, 0, 8)) }}
                            </td>
                            <td class="px-6 py-3">
                                <x-badge :type="match($tx->type) {
                                    'TRANSFER'         => 'teal',
                                    'PAYMENT'          => 'navy',
                                    'DEPOSIT'          => 'info',
                                    'WITHDRAWAL'       => 'gray',
                                    'LOAN_DISBURSEMENT','LOAN_REPAYMENT' => 'accent',
                                    'DUE_PAYMENT'      => 'purple',
                                    default            => 'gray'
                                }" :text="str_replace('_', ' ', $tx->type)"/>
                            </td>
                            <td class="px-6 py-3 font-semibold text-gray-900">
                                ${{ number_format($tx->amount, 2, ',', '.') }}
                            </td>
                            <td class="px-6 py-3 text-gray-500 text-xs">
                                <span class="font-medium text-gray-700">{{ $tx->sender?->name ?? '—' }}</span>
                                <span class="mx-1 text-gray-300">→</span>
                                <span class="font-medium text-gray-700">{{ $tx->receiver?->name ?? '—' }}</span>
                            </td>
                            <td class="px-6 py-3">
                                <x-badge :type="match($tx->status) {
                                    'COMPLETED' => 'success',
                                    'PENDING'   => 'warning',
                                    'FAILED'    => 'danger',
                                    'REVERSED'  => 'gray',
                                    default     => 'gray'
                                }" :text="$tx->status"/>
                            </td>
                            <td class="px-6 py-3 text-gray-500 text-xs">{{ $tx->created_at->format('d/m/Y H:i') }}</td>
                            <td class="px-6 py-3 text-right">
                                <a href="{{ route('transactions.show', $tx->id) }}"
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
                            <td colspan="7" class="px-6 py-12 text-center text-gray-400">No se encontraron transacciones</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if(isset($transactions) && $transactions->hasPages())
            <div class="px-6 py-4 border-t border-gray-100">{{ $transactions->withQueryString()->links() }}</div>
        @endif
    </div>
</div>
@endsection
