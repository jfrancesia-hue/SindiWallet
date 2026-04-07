<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    protected ApiClient $api;

    public function __construct()
    {
        $this->api = new ApiClient();
    }

    public function index(Request $request)
    {
        $params = array_filter([
            'page' => $request->get('page', 1),
            'limit' => 20,
            'type' => $request->get('type'),
            'status' => $request->get('status'),
            'dateFrom' => $request->get('dateFrom'),
            'dateTo' => $request->get('dateTo'),
        ]);

        $response = $this->api->getTransactions($params);

        return view('transactions.index', [
            'transactions' => $response['data'] ?? [],
            'meta' => $response['meta'] ?? null,
            'filters' => $request->only(['type', 'status', 'dateFrom', 'dateTo']),
        ]);
    }

    public function show(string $id)
    {
        $response = $this->api->getTransaction($id);
        return view('transactions.show', ['transaction' => $response['data'] ?? $response]);
    }
}
