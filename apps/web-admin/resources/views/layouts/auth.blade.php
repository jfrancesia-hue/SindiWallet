<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Acceso') — SindiWallet Admin</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center" style="background-color: #0D1440;">

    <div class="w-full max-w-md px-4">
        {{-- Logo --}}
        <div class="text-center mb-8">
            <div class="inline-flex items-center gap-3 mb-2">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background-color: #00A89D;">
                    <span class="text-white font-bold text-lg">SW</span>
                </div>
                <span class="text-2xl font-bold text-white">SindiWallet</span>
            </div>
            <p class="text-gray-400 text-sm">Panel de Administración</p>
        </div>

        {{-- Card --}}
        <div class="bg-white rounded-2xl shadow-2xl p-8">
            @yield('content')
        </div>

        <p class="text-center text-gray-500 text-xs mt-6">
            &copy; {{ date('Y') }} SindiWallet. Todos los derechos reservados.
        </p>
    </div>

</body>
</html>
