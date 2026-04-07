@extends('layouts.app')

@section('title', 'Editar Organización')

@section('breadcrumb')
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        <a href="{{ route('organizations.index') }}" class="hover:text-gray-700">Organizaciones</a>
    </li>
    <li class="flex items-center gap-1 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        Editar: {{ $organization->name }}
    </li>
@endsection

@section('content')
<div class="max-w-2xl mx-auto space-y-5">

    <div>
        <h1 class="text-2xl font-bold text-gray-900">Editar Organización</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ $organization->name }}</p>
    </div>

    <form method="POST" action="{{ route('organizations.update', $organization->id) }}" enctype="multipart/form-data" class="space-y-5">
        @csrf
        @method('PATCH')

        {{-- Basic data --}}
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Datos de la Organización</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nombre <span class="text-red-500">*</span></label>
                    <input type="text" name="name" value="{{ old('name', $organization->name) }}" required
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Slug <span class="text-red-500">*</span></label>
                    <input type="text" name="slug" value="{{ old('slug', $organization->slug) }}" required
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">CUIT</label>
                    <input type="text" name="cuit" value="{{ old('cuit', $organization->cuit) }}"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="email" name="email" value="{{ old('email', $organization->email) }}"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                    <input type="tel" name="phone" value="{{ old('phone', $organization->phone) }}"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>

                <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
                    <input type="text" name="address" value="{{ old('address', $organization->address) }}"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>

                <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Sitio web</label>
                    <input type="url" name="website" value="{{ old('website', $organization->website) }}"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
            </div>
        </div>

        {{-- Branding --}}
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Branding</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Color primario</label>
                    <div class="flex items-center gap-3">
                        <input
                            type="color"
                            name="primary_color"
                            value="{{ old('primary_color', $organization->primary_color ?? '#1F2B6C') }}"
                            class="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                        >
                        <input
                            type="text"
                            value="{{ old('primary_color', $organization->primary_color ?? '#1F2B6C') }}"
                            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                            placeholder="#1F2B6C"
                        >
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Color de acento</label>
                    <div class="flex items-center gap-3">
                        <input
                            type="color"
                            name="accent_color"
                            value="{{ old('accent_color', $organization->accent_color ?? '#00A89D') }}"
                            class="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                        >
                        <input
                            type="text"
                            value="{{ old('accent_color', $organization->accent_color ?? '#00A89D') }}"
                            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                            placeholder="#00A89D"
                        >
                    </div>
                </div>

                <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
                    @if($organization->logo_url ?? false)
                        <div class="mb-3">
                            <img src="{{ $organization->logo_url }}" alt="Logo actual" class="h-12 object-contain border border-gray-200 rounded-lg p-1">
                            <p class="text-xs text-gray-400 mt-1">Logo actual — subir uno nuevo lo reemplazará</p>
                        </div>
                    @endif
                    <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        class="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer hover:file:opacity-90"
                        style="--file-bg: #00A89D;"
                    >
                    <p class="text-xs text-gray-400 mt-1">PNG, JPG o SVG. Máximo 2MB.</p>
                </div>
            </div>
        </div>

        <div class="flex items-center justify-end gap-3">
            <a href="{{ route('organizations.index') }}" class="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
            </a>
            <button type="submit" class="px-6 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style="background-color: #00A89D;">
                Guardar Cambios
            </button>
        </div>
    </form>
</div>
@endsection
