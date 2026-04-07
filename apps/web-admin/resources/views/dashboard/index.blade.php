@extends('layouts.app')

@section('title', 'Dashboard')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Dashboard
    </li>
@endsection

@section('content')
<div class="space-y-6">

    {{-- Page header --}}
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-sm text-gray-500 mt-0.5">Resumen general de la plataforma — {{ now()->format('d/m/Y') }}</p>
        </div>
        <div class="flex items-center gap-2">
            <select class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option>Últimos 30 días</option>
                <option>Últimos 7 días</option>
                <option>Este mes</option>
                <option>Este año</option>
            </select>
        </div>
    </div>

    {{-- Stat cards --}}
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <x-stat-card
            title="Total Afiliados"
            :value="number_format($stats['total_users'] ?? 0)"
            icon="users"
            :change="$stats['users_change'] ?? '+12%'"
            changeType="up"
            color="navy"
        />
        <x-stat-card
            title="Wallets Activas"
            :value="number_format($stats['active_wallets'] ?? 0)"
            icon="wallet"
            :change="$stats['wallets_change'] ?? '+8%'"
            changeType="up"
            color="teal"
        />
        <x-stat-card
            title="Transacciones del Mes"
            :value="'$' . number_format($stats['monthly_transactions'] ?? 0, 0, ',', '.')"
            icon="transactions"
            :change="$stats['transactions_change'] ?? '+5%'"
            changeType="up"
            color="accent"
        />
        <x-stat-card
            title="Cuotas Cobradas"
            :value="'$' . number_format($stats['dues_collected'] ?? 0, 0, ',', '.')"
            icon="money"
            :change="$stats['dues_change'] ?? '-2%'"
            changeType="down"
            color="purple"
        />
    </div>

    {{-- Charts row --}}
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {{-- Line chart --}}
        <div class="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-base font-semibold text-gray-900">Transacciones — Últimos 12 meses</h2>
                    <p class="text-sm text-gray-500">Volumen total en pesos</p>
                </div>
            </div>
            <div
                x-data="transactionsChart()"
                x-init="init()"
            >
                <canvas id="transactionsLineChart" height="100"></canvas>
            </div>
        </div>

        {{-- Donut chart --}}
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="mb-6">
                <h2 class="text-base font-semibold text-gray-900">Tipos de Transacción</h2>
                <p class="text-sm text-gray-500">Distribución del mes actual</p>
            </div>
            <div
                x-data="donutChart()"
                x-init="init()"
            >
                <canvas id="transactionsDonutChart"></canvas>
            </div>
            <div class="mt-4 space-y-2">
                @php
                    $txTypes = $transactionTypes ?? [
                        ['label' => 'Transferencias', 'color' => '#00A89D', 'pct' => '35%'],
                        ['label' => 'Cuotas', 'color' => '#1F2B6C', 'pct' => '28%'],
                        ['label' => 'Préstamos', 'color' => '#F58220', 'pct' => '20%'],
                        ['label' => 'Beneficios', 'color' => '#8B5CF6', 'pct' => '17%'],
                    ];
                @endphp
                @foreach($txTypes as $type)
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full" style="background-color: {{ $type['color'] }}"></div>
                            <span class="text-gray-600">{{ $type['label'] }}</span>
                        </div>
                        <span class="font-semibold text-gray-900">{{ $type['pct'] }}</span>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    {{-- Recent transactions table --}}
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-900">Últimas Transacciones</h2>
            <a href="{{ route('transactions.index') }}" class="text-sm font-medium hover:underline" style="color: #00A89D;">
                Ver todas
            </a>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">De → Para</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @forelse($recentTransactions ?? [] as $tx)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-3 font-mono text-gray-500 text-xs">
                                <a href="{{ route('transactions.show', $tx->id) }}" class="hover:text-teal-600">
                                    #{{ strtoupper(substr($tx->id, 0, 8)) }}
                                </a>
                            </td>
                            <td class="px-6 py-3">
                                <x-badge :type="match($tx->type) {
                                    'TRANSFER' => 'teal',
                                    'PAYMENT' => 'navy',
                                    'LOAN' => 'accent',
                                    default => 'info'
                                }" :text="$tx->type"/>
                            </td>
                            <td class="px-6 py-3 font-semibold text-gray-900">
                                ${{ number_format($tx->amount, 2, ',', '.') }}
                            </td>
                            <td class="px-6 py-3 text-gray-500">
                                {{ $tx->sender?->name ?? '—' }} → {{ $tx->receiver?->name ?? '—' }}
                            </td>
                            <td class="px-6 py-3">
                                <x-badge :type="match($tx->status) {
                                    'COMPLETED' => 'success',
                                    'PENDING'   => 'warning',
                                    'FAILED'    => 'danger',
                                    default     => 'gray'
                                }" :text="$tx->status"/>
                            </td>
                            <td class="px-6 py-3 text-gray-500">{{ $tx->created_at->format('d/m/Y H:i') }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                                No hay transacciones recientes
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
function transactionsChart() {
    return {
        init() {
            const ctx = document.getElementById('transactionsLineChart').getContext('2d');
            const labels = @json($chartLabels ?? ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']);
            const data   = @json($chartData ?? [120000,145000,132000,158000,172000,168000,195000,187000,210000,225000,198000,240000]);
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Transacciones ($)',
                        data,
                        borderColor: '#00A89D',
                        backgroundColor: 'rgba(0,168,157,0.08)',
                        borderWidth: 2.5,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#00A89D',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            grid: { color: '#f3f4f6' },
                            ticks: {
                                callback: v => '$' + (v/1000).toFixed(0) + 'k',
                                font: { size: 11 }
                            }
                        },
                        x: { grid: { display: false }, ticks: { font: { size: 11 } } }
                    }
                }
            });
        }
    };
}

function donutChart() {
    return {
        init() {
            const ctx = document.getElementById('transactionsDonutChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: @json(collect($transactionTypes ?? [])->pluck('label')->toArray() ?: ['Transferencias','Cuotas','Préstamos','Beneficios']),
                    datasets: [{
                        data: @json(collect($transactionTypes ?? [])->pluck('value')->toArray() ?: [35, 28, 20, 17]),
                        backgroundColor: ['#00A89D','#1F2B6C','#F58220','#8B5CF6'],
                        borderWidth: 0,
                        hoverOffset: 6,
                    }]
                },
                options: {
                    responsive: true,
                    cutout: '72%',
                    plugins: { legend: { display: false } }
                }
            });
        }
    };
}
</script>
@endsection
