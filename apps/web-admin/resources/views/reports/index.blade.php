@extends('layouts.app')

@section('title', 'Reportes')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Reportes
    </li>
@endsection

@section('content')
<div class="space-y-6">

    <div>
        <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
        <p class="text-sm text-gray-500 mt-0.5">Generación y descarga de reportes del sistema</p>
    </div>

    {{-- Generate reports --}}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @php
            $reportTypes = [
                [
                    'key'   => 'dues',
                    'label' => 'Reporte de Cuotas',
                    'desc'  => 'Cobros, estado y conciliación por período',
                    'icon'  => 'dues',
                    'color' => '#1F2B6C',
                    'bg'    => 'bg-blue-50',
                ],
                [
                    'key'   => 'transactions',
                    'label' => 'Reporte de Transacciones',
                    'desc'  => 'Historial completo de movimientos',
                    'icon'  => 'transactions',
                    'color' => '#00A89D',
                    'bg'    => 'bg-teal-50',
                ],
                [
                    'key'   => 'loans',
                    'label' => 'Reporte de Préstamos',
                    'desc'  => 'Cartera activa, morosidad y pagos',
                    'icon'  => 'loans',
                    'color' => '#F58220',
                    'bg'    => 'bg-orange-50',
                ],
                [
                    'key'   => 'affiliates',
                    'label' => 'Reporte de Afiliados',
                    'desc'  => 'Padrón completo con estado KYC y wallet',
                    'icon'  => 'users',
                    'color' => '#8B5CF6',
                    'bg'    => 'bg-purple-50',
                ],
            ];
        @endphp

        @foreach($reportTypes as $report)
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div class="w-10 h-10 rounded-xl {{ $report['bg'] }} flex items-center justify-center mb-4">
                    @include('components.sidebar-icon', ['icon' => $report['icon'], 'active' => false])
                </div>
                <h3 class="text-sm font-semibold text-gray-900 mb-1">{{ $report['label'] }}</h3>
                <p class="text-xs text-gray-500 mb-4">{{ $report['desc'] }}</p>
                <form method="POST" action="{{ route('reports.generate') }}">
                    @csrf
                    <input type="hidden" name="type" value="{{ $report['key'] }}">
                    <div class="flex gap-2 mb-3">
                        <input type="date" name="date_from" value="{{ now()->startOfMonth()->format('Y-m-d') }}"
                            class="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500">
                        <input type="date" name="date_to" value="{{ now()->format('Y-m-d') }}"
                            class="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500">
                    </div>
                    <select name="format" class="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white mb-3">
                        <option value="xlsx">Excel (.xlsx)</option>
                        <option value="csv">CSV</option>
                        <option value="pdf">PDF</option>
                    </select>
                    <button type="submit"
                        class="w-full py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
                        style="background-color: {{ $report['color'] }};">
                        Generar reporte
                    </button>
                </form>
            </div>
        @endforeach
    </div>

    {{-- Generated reports list --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-base font-semibold text-gray-900">Reportes generados</h2>
            <span class="text-sm text-gray-400">Últimos 30 días</span>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Formato</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Período</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Generado</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Descarga</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @forelse($generatedReports ?? [] as $report)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-3 font-medium text-gray-900">{{ $report->name }}</td>
                            <td class="px-6 py-3">
                                <x-badge type="info" :text="strtoupper($report->type)"/>
                            </td>
                            <td class="px-6 py-3 text-gray-500 uppercase text-xs font-mono">{{ $report->format }}</td>
                            <td class="px-6 py-3 text-gray-500 text-xs">{{ $report->date_from }} → {{ $report->date_to }}</td>
                            <td class="px-6 py-3 text-gray-500 text-xs">{{ $report->created_at->format('d/m/Y H:i') }}</td>
                            <td class="px-6 py-3">
                                <x-badge :type="match($report->status) { 'READY' => 'success', 'PROCESSING' => 'warning', 'FAILED' => 'danger', default => 'gray' }" :text="$report->status"/>
                            </td>
                            <td class="px-6 py-3 text-right">
                                @if($report->status === 'READY' && $report->download_url)
                                    <a href="{{ $report->download_url }}"
                                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90"
                                        style="background-color: #00A89D;" download>
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                        </svg>
                                        Descargar
                                    </a>
                                @else
                                    <span class="text-gray-400 text-xs">—</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-6 py-12 text-center text-gray-400">No hay reportes generados</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
