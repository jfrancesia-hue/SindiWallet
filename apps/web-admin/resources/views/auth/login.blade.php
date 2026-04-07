@extends('layouts.auth')

@section('title', 'Iniciar Sesión')

@section('content')
<div>
    <h2 class="text-2xl font-bold text-gray-900 mb-1">Bienvenido</h2>
    <p class="text-gray-500 text-sm mb-8">Ingresá tus credenciales para continuar</p>

    @if($errors->any())
        <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <ul class="list-disc list-inside space-y-1">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('login') }}" class="space-y-5">
        @csrf

        <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
            </label>
            <input
                type="email"
                id="email"
                name="email"
                value="{{ old('email') }}"
                required
                autofocus
                autocomplete="email"
                placeholder="admin@sindiwallet.com"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors @error('email') border-red-400 @enderror"
            >
        </div>

        <div>
            <div class="flex items-center justify-between mb-1.5">
                <label for="password" class="block text-sm font-medium text-gray-700">
                    Contraseña
                </label>
                @if(Route::has('password.request'))
                    <a href="{{ route('password.request') }}" class="text-sm font-medium hover:underline" style="color: #00A89D;">
                        ¿Olvidaste tu contraseña?
                    </a>
                @endif
            </div>
            <input
                type="password"
                id="password"
                name="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors @error('password') border-red-400 @enderror"
            >
        </div>

        <div class="flex items-center gap-2">
            <input
                type="checkbox"
                id="remember"
                name="remember"
                class="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            >
            <label for="remember" class="text-sm text-gray-600">Recordarme</label>
        </div>

        <button
            type="submit"
            class="w-full py-2.5 px-4 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            style="background-color: #00A89D;"
        >
            Ingresar
        </button>
    </form>
</div>
@endsection
