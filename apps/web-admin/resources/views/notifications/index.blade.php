@extends('layouts.app')

@section('title', 'Notificaciones')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Notificaciones
    </li>
@endsection

@section('content')
<div class="space-y-6">

    <div>
        <h1 class="text-2xl font-bold text-gray-900">Notificaciones</h1>
        <p class="text-sm text-gray-500 mt-0.5">Envío masivo y gestión de comunicaciones a afiliados</p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {{-- Compose form --}}
        <div class="xl:col-span-1">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Nuevo Envío</h2>
                <form method="POST" action="{{ route('notifications.send') }}" x-data="{ channel: 'push', preview: false }">
                    @csrf

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Título <span class="text-red-500">*</span></label>
                            <input type="text" name="title" value="{{ old('title') }}" required maxlength="100"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 @error('title') border-red-400 @enderror"
                                placeholder="Asunto del mensaje">
                            @error('title')<p class="mt-1 text-xs text-red-500">{{ $message }}</p>@enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Mensaje <span class="text-red-500">*</span></label>
                            <textarea name="body" required rows="4" maxlength="500"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 @error('body') border-red-400 @enderror resize-none"
                                placeholder="Escribí el contenido de la notificación...">{{ old('body') }}</textarea>
                            @error('body')<p class="mt-1 text-xs text-red-500">{{ $message }}</p>@enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Canal de envío <span class="text-red-500">*</span></label>
                            <div class="grid grid-cols-3 gap-2">
                                @foreach(['push' => 'Push', 'email' => 'Email', 'whatsapp' => 'WhatsApp'] as $val => $label)
                                    <label class="cursor-pointer">
                                        <input type="radio" name="channel" value="{{ $val }}" x-model="channel" {{ old('channel', 'push') === $val ? 'checked' : '' }} class="sr-only peer">
                                        <div class="flex items-center justify-center gap-1 py-2 text-xs font-medium rounded-lg border-2 transition-colors peer-checked:border-teal-500 peer-checked:text-teal-700 peer-checked:bg-teal-50 border-gray-200 text-gray-500 hover:border-gray-300">
                                            {{ $label }}
                                        </div>
                                    </label>
                                @endforeach
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Destinatarios</label>
                            <select name="recipient_filter" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                                <option value="all">Todos los afiliados activos</option>
                                <option value="kyc_pending">KYC pendiente</option>
                                <option value="wallet_inactive">Wallet inactiva</option>
                                <option value="dues_overdue">Cuotas vencidas</option>
                                <option value="loans_active">Con préstamos activos</option>
                                <option value="custom">Selección personalizada</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Programar envío (opcional)</label>
                            <input type="datetime-local" name="scheduled_at"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <p class="text-xs text-gray-400 mt-1">Dejá vacío para enviar inmediatamente</p>
                        </div>

                        <button type="submit"
                            class="w-full py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            style="background-color: #00A89D;">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                            </svg>
                            Enviar notificación
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {{-- Send history --}}
        <div class="xl:col-span-2">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 class="text-base font-semibold text-gray-900">Historial de envíos</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Título</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Canal</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Destinatarios</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Enviados</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            @forelse($notifications ?? [] as $notif)
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="px-6 py-3">
                                        <p class="font-medium text-gray-900 max-w-xs truncate">{{ $notif->title }}</p>
                                        <p class="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{{ $notif->body }}</p>
                                    </td>
                                    <td class="px-6 py-3">
                                        <x-badge :type="match($notif->channel) {
                                            'push'     => 'navy',
                                            'email'    => 'teal',
                                            'whatsapp' => 'success',
                                            default    => 'gray'
                                        }" :text="strtoupper($notif->channel)"/>
                                    </td>
                                    <td class="px-6 py-3 text-gray-600">{{ $notif->total_recipients ?? 0 }}</td>
                                    <td class="px-6 py-3">
                                        <span class="text-gray-900 font-semibold">{{ $notif->sent_count ?? 0 }}</span>
                                        @if(($notif->failed_count ?? 0) > 0)
                                            <span class="text-red-400 text-xs ml-1">({{ $notif->failed_count }} fallidos)</span>
                                        @endif
                                    </td>
                                    <td class="px-6 py-3">
                                        <x-badge :type="match($notif->status) {
                                            'SENT'       => 'success',
                                            'SCHEDULED'  => 'info',
                                            'PROCESSING' => 'warning',
                                            'FAILED'     => 'danger',
                                            default      => 'gray'
                                        }" :text="match($notif->status) {
                                            'SENT'       => 'Enviado',
                                            'SCHEDULED'  => 'Programado',
                                            'PROCESSING' => 'Procesando',
                                            'FAILED'     => 'Fallido',
                                            default      => $notif->status
                                        }"/>
                                    </td>
                                    <td class="px-6 py-3 text-gray-500 text-xs">
                                        {{ $notif->sent_at?->format('d/m/Y H:i') ?? $notif->scheduled_at?->format('d/m/Y H:i') ?? '—' }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="px-6 py-12 text-center text-gray-400">No hay envíos registrados</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                @if(isset($notifications) && $notifications->hasPages())
                    <div class="px-6 py-4 border-t border-gray-100">{{ $notifications->links() }}</div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
