<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;

class DashboardController extends Controller
{
    public function index()
    {
        $api = new ApiClient();
        $user = session('user');

        $stats = $api->getOrganizationStats($user['orgId']);
        $transactions = $api->getTransactions(['limit' => 10]);

        return view('dashboard.index', [
            'stats' => $stats['data'] ?? [],
            'transactions' => $transactions['data'] ?? [],
        ]);
    }
}
