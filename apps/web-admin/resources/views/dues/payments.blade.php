@extends('layouts.app')

@section('title', 'Pagos de Cuotas')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        <a href="{{ route('dues.index') }}" class="hover:text-gray-700">Cuotas</a>
    </li>
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Pagos
    </li>
@endsection

@section('content')
<div class="space-y-5">

    <div>
        <h1 class="text-2xl font-bold text-gray-900">Pagos de Cuotas</h1>
        <p class="text-sm text-gray-500 mt-0.5">Historial y estado de cobros por período</p>
    </div>

    {{-- Summary cards --}}
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p class="text-sm text-gray-500">Total esperado</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">${{ number_format($summary['expected'] ?? 0, 0, ',', '.') }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p class="text-sm text-gray-500">Total cobrado</p>
            <p class="text-2xl font-bold mt-1" style="color: #00A89D;">${{ number_format($summary['collected'] ?? 0, 0, ',', '.') }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p class="text-sm text-gray-500">Pendiente</p>
            <p class="text-2xl font-bold text-red-500 mt-1">${{ number_format($summary['pending'] ?? 0, 0, ',', '.') }}</p>
        </div>
    </div>

    {{-- Period filter --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <form method="GET" action="{{ route('dues.payments') }}" class="flex flex-wrap gap-3">
            <select name="month" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                @for($m = 1; $m <= 12; $m++)
                    <option value="{{ $m }}" {{ request('month', now()->month) == $m ? 'selected' : '' }}>
                        {{ \Carbon\Carbon::create(null, $m, 1)->isoFormat('MMMM') }}
                    </option>
                @endfor
            </select>
            <select name="year" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                @for($y = now()->year; $y >= now()->year - 3; $y--)
                    <option value="{{ $y }}" {{ request('year', now()->year) == $y ? 'selected' : '' }}>{{ $y }}</option>
                @endfor
            </select>
            <select name="due_id" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Todas las cuotas</option>
                @foreach($dues ?? [] as $due)
                    <option value="{{ $due->id }}" {{ request('due_id') == $due->id ? 'selected' : '' }}>{{ $due->name }}</option>
                @endforeach
            </select>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90" style="background-color: #1F2B6C;">
                Filtrar
            </button>
        </form>
    </div>

    {{-- Table --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Afiliado</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cuota</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Período</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fuente</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @forelse($payments ?? [] as $payment)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-3">
                                <div class="flex items-center gap-2">
                                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style="background-color: #1F2B6C;">
                                        {{ strtoupper(substr($payment->user?->name ?? 'U', 0, 1)) }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-900">{{ $payment->user?->name }} {{ $payment->user?->last_name }}</p>
                                        <p class="text-xs text-gray-400">{{ $payment->user?->dni }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-3 text-gray-700">{{ $payment->due?->name ?? '—' }}</td>
                            <td class="px-6 py-3 text-gray-600">{{ $payment->period }}</td>
                            <td class="px-6 py-3 font-semibold text-gray-900">${{ number_format($payment->amount, 2, ',', '.') }}</td>
                            <td class="px-6 py-3">
                                <x-badge :type="match($payment->status) {
                                    'PAID'    => 'success',
                                    'PENDING' => 'warning',
                                    'OVERDUE' => 'danger',
                                    default   => 'gray'
                                }" :text="match($payment->status) {
                                    'PAID'    => 'Pagado',
                                    'PENDING' => 'Pendiente',
                                    'OVERDUE' => 'Vencido',
                                    default   => $payment->status
                                }"/>
                            </td>
                            <td class="px-6 py-3">
                                <x-badge :type="($payment->source ?? '') === 'RETENTION' ? 'navy' : 'teal'" :text="($payment->source ?? '') === 'RETENTION' ? 'Retención' : 'Wallet'"/>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-gray-400">Sin pagos en este período</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if(isset($payments) && $payments->hasPages())
            <div class="px-6 py-4 border-t border-gray-100">{{ $payments->withQueryString()->links() }}</div>
        @endif
    </div>
</div>
@endsection
