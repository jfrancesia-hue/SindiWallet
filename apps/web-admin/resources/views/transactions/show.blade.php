@extends('layouts.app')

@section('title', 'Transacción #' . strtoupper(substr($transaction->id, 0, 8)))

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        <a href="{{ route('transactions.index') }}" class="hover:text-gray-700">Transacciones</a>
    </li>
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        #{{ strtoupper(substr($transaction->id, 0, 8)) }}
    </li>
@endsection

@section('content')
<div class="max-w-4xl mx-auto space-y-5">

    {{-- Header --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <p class="text-xs text-gray-500 font-mono mb-1">{{ $transaction->id }}</p>
                <div class="flex items-center gap-3">
                    <h1 class="text-2xl font-bold text-gray-900">${{ number_format($transaction->amount, 2, ',', '.') }}</h1>
                    <x-badge :type="match($transaction->status) {
                        'COMPLETED' => 'success',
                        'PENDING'   => 'warning',
                        'FAILED'    => 'danger',
                        'REVERSED'  => 'gray',
                        default     => 'gray'
                    }" :text="$transaction->status"/>
                </div>
                <div class="flex items-center gap-2 mt-2">
                    <x-badge type="teal" :text="str_replace('_', ' ', $transaction->type)"/>
                    <span class="text-sm text-gray-500">{{ $transaction->created_at->format('d/m/Y H:i:s') }}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {{-- Details --}}
        <div class="lg:col-span-2 space-y-5">

            {{-- Transaction info --}}
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Detalle de la Transacción</h2>
                <div class="grid grid-cols-2 gap-4">
                    @php
                        $details = [
                            ['Tipo', str_replace('_', ' ', $transaction->type)],
                            ['Monto', '$' . number_format($transaction->amount, 2, ',', '.')],
                            ['Fee', '$' . number_format($transaction->fee ?? 0, 2, ',', '.')],
                            ['Monto neto', '$' . number_format(($transaction->amount ?? 0) - ($transaction->fee ?? 0), 2, ',', '.')],
                            ['Estado', $transaction->status],
                            ['Referencia', $transaction->reference ?? '—'],
                        ];
                    @endphp
                    @foreach($details as [$label, $value])
                        <div>
                            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">{{ $label }}</p>
                            <p class="mt-0.5 text-sm font-medium text-gray-900">{{ $value }}</p>
                        </div>
                    @endforeach

                    @if($transaction->description)
                        <div class="col-span-2">
                            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Descripción</p>
                            <p class="mt-0.5 text-sm text-gray-900">{{ $transaction->description }}</p>
                        </div>
                    @endif

                    @if($transaction->metadata)
                        <div class="col-span-2">
                            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Metadata</p>
                            <pre class="text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto text-gray-700">{{ json_encode($transaction->metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</pre>
                        </div>
                    @endif
                </div>
            </div>

            {{-- Participants --}}
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Participantes</h2>
                <div class="flex items-center gap-4">
                    {{-- Sender --}}
                    <div class="flex-1 p-4 bg-gray-50 rounded-xl text-center">
                        <div class="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold mb-2" style="background-color: #1F2B6C;">
                            {{ strtoupper(substr($transaction->sender?->name ?? 'S', 0, 1)) }}
                        </div>
                        <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Origen</p>
                        <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ $transaction->sender?->name ?? 'Sistema' }}</p>
                        <p class="text-xs text-gray-400">{{ $transaction->sender?->email ?? '—' }}</p>
                    </div>

                    {{-- Arrow --}}
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 flex items-center justify-center">
                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                            </svg>
                        </div>
                    </div>

                    {{-- Receiver --}}
                    <div class="flex-1 p-4 rounded-xl text-center" style="background-color: rgba(0,168,157,0.08);">
                        <div class="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold mb-2" style="background-color: #00A89D;">
                            {{ strtoupper(substr($transaction->receiver?->name ?? 'R', 0, 1)) }}
                        </div>
                        <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Destino</p>
                        <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ $transaction->receiver?->name ?? 'Sistema' }}</p>
                        <p class="text-xs text-gray-400">{{ $transaction->receiver?->email ?? '—' }}</p>
                    </div>
                </div>
            </div>
        </div>

        {{-- Timeline --}}
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Timeline</h2>
            <div class="space-y-0">
                @php
                    $statusHistory = $transaction->statusHistory ?? collect([
                        (object)['status' => 'PENDING', 'created_at' => $transaction->created_at, 'note' => 'Transacción iniciada'],
                        (object)['status' => $transaction->status, 'created_at' => $transaction->updated_at, 'note' => 'Estado actualizado'],
                    ]);
                @endphp
                @foreach($statusHistory as $index => $entry)
                    <div class="relative flex gap-3 pb-5 last:pb-0">
                        @if(!$loop->last)
                            <div class="absolute left-3 top-6 bottom-0 w-px bg-gray-200"></div>
                        @endif
                        <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                            {{ match($entry->status) {
                                'COMPLETED' => 'bg-teal-100',
                                'PENDING'   => 'bg-yellow-100',
                                'FAILED'    => 'bg-red-100',
                                default     => 'bg-gray-100'
                            } }}">
                            <div class="w-2 h-2 rounded-full
                                {{ match($entry->status) {
                                    'COMPLETED' => 'bg-teal-500',
                                    'PENDING'   => 'bg-yellow-500',
                                    'FAILED'    => 'bg-red-500',
                                    default     => 'bg-gray-400'
                                } }}">
                            </div>
                        </div>
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-semibold text-gray-900">{{ $entry->status }}</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ $entry->note ?? '' }}</p>
                            <p class="text-xs text-gray-400 mt-0.5">{{ $entry->created_at->format('d/m/Y H:i:s') }}</p>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</div>
@endsection
