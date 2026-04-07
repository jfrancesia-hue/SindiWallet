@extends('layouts.app')

@section('title', $user->name . ' ' . $user->last_name)

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        <a href="{{ route('users.index') }}" class="hover:text-gray-700">Usuarios</a>
    </li>
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        {{ $user->name }}
    </li>
@endsection

@section('content')
<div class="space-y-5">

    {{-- Header card --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" style="background-color: #1F2B6C;">
                    {{ strtoupper(substr($user->name, 0, 1)) }}
                </div>
                <div>
                    <h1 class="text-xl font-bold text-gray-900">{{ $user->name }} {{ $user->last_name }}</h1>
                    <p class="text-gray-500 text-sm">{{ $user->email }}</p>
                    <div class="flex items-center gap-2 mt-1.5">
                        <x-badge :type="match($user->role) {
                            'SUPERADMIN' => 'purple',
                            'ADMIN'      => 'navy',
                            'AFFILIATE'  => 'teal',
                            'MERCHANT'   => 'accent',
                            default      => 'gray'
                        }" :text="$user->role"/>
                        <x-badge :type="match($user->kyc_status ?? 'PENDING') {
                            'APPROVED' => 'success',
                            'PENDING'  => 'warning',
                            'REJECTED' => 'danger',
                            default    => 'gray'
                        }" :text="'KYC: ' . ($user->kyc_status ?? 'PENDING')"/>
                        @if(!($user->is_active ?? true))
                            <x-badge type="danger" text="Inactivo"/>
                        @endif
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <a href="{{ route('users.edit', $user->id) }}"
                    class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
                    style="background-color: #00A89D;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Editar
                </a>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {{-- Personal info --}}
        <div class="xl:col-span-2 space-y-5">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Información Personal</h2>
                <div class="grid grid-cols-2 gap-5">
                    @php
                        $fields = [
                            ['label' => 'DNI', 'value' => $user->dni ?? '—'],
                            ['label' => 'CUIT', 'value' => $user->cuit ?? '—'],
                            ['label' => 'Teléfono', 'value' => $user->phone ?? '—'],
                            ['label' => 'Empleador', 'value' => $user->employer ?? '—'],
                            ['label' => 'CUIT Empleador', 'value' => $user->employer_cuit ?? '—'],
                            ['label' => 'Salario', 'value' => $user->salary ? '$' . number_format($user->salary, 2, ',', '.') : '—'],
                            ['label' => 'Fecha Afiliación', 'value' => $user->affiliation_date?->format('d/m/Y') ?? '—'],
                            ['label' => 'Miembro desde', 'value' => $user->created_at->format('d/m/Y')],
                        ];
                    @endphp
                    @foreach($fields as $field)
                        <div>
                            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">{{ $field['label'] }}</p>
                            <p class="mt-0.5 text-sm font-medium text-gray-900">{{ $field['value'] }}</p>
                        </div>
                    @endforeach
                </div>
            </div>

            {{-- Recent transactions --}}
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 class="text-base font-semibold text-gray-900">Últimas Transacciones</h2>
                    <a href="{{ route('transactions.index', ['user_id' => $user->id]) }}" class="text-sm hover:underline" style="color: #00A89D;">Ver todas</a>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            @forelse($user->transactions ?? [] as $tx)
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-3 font-mono text-xs text-gray-500">#{{ strtoupper(substr($tx->id, 0, 8)) }}</td>
                                    <td class="px-6 py-3"><x-badge type="teal" :text="$tx->type"/></td>
                                    <td class="px-6 py-3 font-semibold">${{ number_format($tx->amount, 2, ',', '.') }}</td>
                                    <td class="px-6 py-3">
                                        <x-badge :type="match($tx->status) { 'COMPLETED' => 'success', 'PENDING' => 'warning', 'FAILED' => 'danger', default => 'gray' }" :text="$tx->status"/>
                                    </td>
                                    <td class="px-6 py-3 text-gray-500 text-xs">{{ $tx->created_at->format('d/m/Y H:i') }}</td>
                                </tr>
                            @empty
                                <tr><td colspan="5" class="px-6 py-8 text-center text-gray-400">Sin transacciones</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {{-- Sidebar: wallet + dues --}}
        <div class="space-y-5">

            {{-- Wallet --}}
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Wallet</h2>
                @if($user->wallet ?? false)
                    <div class="space-y-3">
                        <div class="text-center py-4 rounded-xl" style="background-color: #1F2B6C;">
                            <p class="text-blue-300 text-xs font-medium uppercase tracking-wide">Saldo disponible</p>
                            <p class="text-3xl font-bold text-white mt-1">${{ number_format($user->wallet->balance ?? 0, 2, ',', '.') }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">CVU</p>
                            <p class="text-sm font-mono font-medium text-gray-900 break-all">{{ $user->wallet->cvu ?? '—' }}</p>
                        </div>
                        <div class="flex items-center justify-between">
                            <p class="text-xs text-gray-500">Estado</p>
                            <x-badge :type="($user->wallet->is_active ?? false) ? 'success' : 'danger'" :text="($user->wallet->is_active ?? false) ? 'Activa' : 'Inactiva'"/>
                        </div>
                    </div>
                @else
                    <p class="text-sm text-gray-400 text-center py-4">Sin wallet asignada</p>
                @endif
            </div>

            {{-- Dues --}}
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h2 class="text-base font-semibold text-gray-900">Cuotas</h2>
                </div>
                <div class="divide-y divide-gray-50">
                    @forelse($user->duePayments ?? [] as $payment)
                        <div class="px-6 py-3 flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ $payment->due?->name }}</p>
                                <p class="text-xs text-gray-500">{{ $payment->period }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-semibold text-gray-900">${{ number_format($payment->amount, 2, ',', '.') }}</p>
                                <x-badge :type="match($payment->status) { 'PAID' => 'success', 'PENDING' => 'warning', 'OVERDUE' => 'danger', default => 'gray' }" :text="$payment->status"/>
                            </div>
                        </div>
                    @empty
                        <div class="px-6 py-8 text-center text-gray-400 text-sm">Sin cuotas registradas</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
