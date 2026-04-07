@extends('layouts.app')

@section('title', 'Solicitudes de Beneficios')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        <a href="{{ route('benefits.index') }}" class="hover:text-gray-700">Beneficios</a>
    </li>
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Solicitudes
    </li>
@endsection

@section('content')
<div class="space-y-5" x-data="benefitRequests()">

    <div>
        <h1 class="text-2xl font-bold text-gray-900">Solicitudes de Beneficios</h1>
        <p class="text-sm text-gray-500 mt-0.5">Cola de solicitudes pendientes de aprobación</p>
    </div>

    {{-- Table --}}
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Afiliado</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Beneficio</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @forelse($requests ?? [] as $req)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-3">
                                <div class="flex items-center gap-2">
                                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style="background-color: #1F2B6C;">
                                        {{ strtoupper(substr($req->user?->name ?? 'U', 0, 1)) }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-900">{{ $req->user?->name }} {{ $req->user?->last_name }}</p>
                                        <p class="text-xs text-gray-400">{{ $req->user?->dni }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-3 text-gray-700">{{ $req->benefit?->name ?? '—' }}</td>
                            <td class="px-6 py-3 font-semibold text-gray-900">${{ number_format($req->amount ?? 0, 2, ',', '.') }}</td>
                            <td class="px-6 py-3 text-gray-500 text-xs">{{ $req->created_at->format('d/m/Y H:i') }}</td>
                            <td class="px-6 py-3">
                                <x-badge :type="match($req->status) {
                                    'APPROVED' => 'success',
                                    'PENDING'  => 'warning',
                                    'REJECTED' => 'danger',
                                    default    => 'gray'
                                }" :text="match($req->status) {
                                    'APPROVED' => 'Aprobado',
                                    'PENDING'  => 'Pendiente',
                                    'REJECTED' => 'Rechazado',
                                    default    => $req->status
                                }"/>
                            </td>
                            <td class="px-6 py-3">
                                @if($req->status === 'PENDING')
                                    <div class="flex items-center justify-end gap-2">
                                        <button
                                            @click="openApprove({{ $req->id }}, '{{ addslashes($req->user?->name) }}', '{{ addslashes($req->benefit?->name) }}')"
                                            class="px-3 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90"
                                            style="background-color: #00A89D;">
                                            Aprobar
                                        </button>
                                        <button
                                            @click="openReject({{ $req->id }}, '{{ addslashes($req->user?->name) }}')"
                                            class="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">
                                            Rechazar
                                        </button>
                                    </div>
                                @else
                                    <span class="text-gray-400 text-xs">Procesado</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-gray-400">No hay solicitudes pendientes</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if(isset($requests) && $requests->hasPages())
            <div class="px-6 py-4 border-t border-gray-100">{{ $requests->links() }}</div>
        @endif
    </div>

    {{-- Approve modal --}}
    <div x-show="showApprove" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="display:none;">
        <div class="absolute inset-0 bg-gray-900/60" @click="showApprove = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Aprobar solicitud</h3>
            <p class="text-sm text-gray-500 mb-4">
                ¿Aprobar el beneficio <span class="font-semibold text-gray-900" x-text="benefitName"></span>
                para <span class="font-semibold text-gray-900" x-text="userName"></span>?
            </p>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Notas (opcional)</label>
                <textarea x-model="notes" rows="2" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Notas de aprobación..."></textarea>
            </div>
            <form :action="`/benefits/requests/${selectedId}/approve`" method="POST">
                @csrf @method('PATCH')
                <input type="hidden" name="notes" :value="notes">
                <div class="flex gap-3">
                    <button type="button" @click="showApprove = false" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                    <button type="submit" class="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style="background-color: #00A89D;">Aprobar</button>
                </div>
            </form>
        </div>
    </div>

    {{-- Reject modal --}}
    <div x-show="showReject" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="display:none;">
        <div class="absolute inset-0 bg-gray-900/60" @click="showReject = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Rechazar solicitud</h3>
            <p class="text-sm text-gray-500 mb-4">Rechazar la solicitud de <span class="font-semibold text-gray-900" x-text="userName"></span>.</p>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Motivo <span class="text-red-500">*</span></label>
                <textarea x-model="reason" rows="3" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Explicá el motivo del rechazo..."></textarea>
            </div>
            <form :action="`/benefits/requests/${selectedId}/reject`" method="POST">
                @csrf @method('PATCH')
                <input type="hidden" name="reason" :value="reason">
                <div class="flex gap-3">
                    <button type="button" @click="showReject = false" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                    <button type="submit" class="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">Rechazar</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function benefitRequests() {
    return {
        showApprove: false,
        showReject: false,
        selectedId: null,
        userName: '',
        benefitName: '',
        notes: '',
        reason: '',
        openApprove(id, user, benefit) {
            this.selectedId = id;
            this.userName = user;
            this.benefitName = benefit;
            this.notes = '';
            this.showApprove = true;
        },
        openReject(id, user) {
            this.selectedId = id;
            this.userName = user;
            this.reason = '';
            this.showReject = true;
        }
    };
}
</script>
@endsection
