<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ApiClient;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function showLogin()
    {
        if (session('access_token')) {
            return redirect()->route('dashboard');
        }
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8',
        ]);

        $api = new ApiClient();
        $response = $api->login($request->email, $request->password);

        if (!($response['success'] ?? false)) {
            return back()->withErrors(['email' => $response['error'] ?? 'Credenciales inválidas']);
        }

        $data = $response['data'];

        session([
            'access_token' => $data['accessToken'],
            'refresh_token' => $data['refreshToken'],
            'user' => $data['user'],
        ]);

        return redirect()->route('dashboard');
    }

    public function logout()
    {
        session()->flush();
        return redirect()->route('login');
    }
}
