<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;

class DashboardController extends Controller
{
    public function index()
    {
        $api = new ApiClient();
        $user = session('user');
        $orgId = $user['orgId'] ?? null;

        $stats = $orgId ? $api->getDashboardStats($orgId) : [];
        $transactions = $api->getTransactions(['limit' => 10]);
        $pendingBenefits = $api->getBenefitRequests(['status' => 'PENDING']);
        $pendingLoans = $api->getLoans(['status' => 'PENDING']);

        return view('dashboard.index', [
            'stats' => $stats['data'] ?? $stats,
            'transactions' => $transactions['data']['data'] ?? [],
            'pendingBenefits' => $pendingBenefits['data'] ?? [],
            'pendingLoans' => $pendingLoans['data'] ?? [],
        ]);
    }
}
