@props([
    'type' => 'info',
    'text' => '',
])

@php
    $styles = [
        'success' => 'bg-teal-100 text-teal-800 ring-teal-200',
        'warning' => 'bg-yellow-100 text-yellow-800 ring-yellow-200',
        'danger'  => 'bg-red-100 text-red-800 ring-red-200',
        'info'    => 'bg-blue-100 text-blue-800 ring-blue-200',
        'purple'  => 'bg-purple-100 text-purple-800 ring-purple-200',
        'navy'    => 'bg-blue-100 text-blue-900 ring-blue-200',
        'teal'    => 'bg-teal-100 text-teal-800 ring-teal-200',
        'accent'  => 'bg-orange-100 text-orange-800 ring-orange-200',
        'gray'    => 'bg-gray-100 text-gray-700 ring-gray-200',
    ];
    $class = $styles[$type] ?? $styles['info'];
@endphp

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset {{ $class }}">
    {{ $text ?: $slot }}
</span>
