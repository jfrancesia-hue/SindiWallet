@props([
    'title' => '',
    'value' => '0',
    'icon' => 'chart',
    'change' => null,
    'changeType' => 'up',
    'color' => 'teal',
])

@php
    $colorMap = [
        'teal'   => ['bg' => 'bg-teal-50',   'icon' => 'text-teal-600',   'iconBg' => 'bg-teal-100'],
        'navy'   => ['bg' => 'bg-blue-50',    'icon' => 'text-blue-700',   'iconBg' => 'bg-blue-100'],
        'accent' => ['bg' => 'bg-orange-50',  'icon' => 'text-orange-500', 'iconBg' => 'bg-orange-100'],
        'purple' => ['bg' => 'bg-purple-50',  'icon' => 'text-purple-600', 'iconBg' => 'bg-purple-100'],
    ];
    $colors = $colorMap[$color] ?? $colorMap['teal'];
@endphp

<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
    <div class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center {{ $colors['iconBg'] }}">
        @if($icon === 'users')
            <svg class="w-6 h-6 {{ $colors['icon'] }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
        @elseif($icon === 'wallet')
            <svg class="w-6 h-6 {{ $colors['icon'] }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
        @elseif($icon === 'transactions')
            <svg class="w-6 h-6 {{ $colors['icon'] }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
        @elseif($icon === 'money')
            <svg class="w-6 h-6 {{ $colors['icon'] }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        @else
            <svg class="w-6 h-6 {{ $colors['icon'] }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
        @endif
    </div>

    <div class="flex-1 min-w-0">
        <p class="text-sm text-gray-500 font-medium">{{ $title }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-0.5">{{ $value }}</p>
        @if($change !== null)
            <div class="flex items-center gap-1 mt-1">
                @if($changeType === 'up')
                    <svg class="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-xs font-medium text-green-600">{{ $change }}</span>
                @else
                    <svg class="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-xs font-medium text-red-600">{{ $change }}</span>
                @endif
                <span class="text-xs text-gray-400">vs mes anterior</span>
            </div>
        @endif
    </div>
</div>
