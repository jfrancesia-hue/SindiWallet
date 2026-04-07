<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    protected ApiClient $api;

    public function __construct()
    {
        $this->api = new ApiClient();
    }

    public function index(Request $request)
    {
        $params = array_filter([
            'status' => $request->get('status'),
            'page' => $request->get('page', 1),
        ]);

        $response = $this->api->getLoans($params);

        return view('loans.index', [
            'loans' => $response['data'] ?? [],
            'meta' => $response['meta'] ?? null,
            'currentStatus' => $request->get('status'),
        ]);
    }

    public function show(string $id)
    {
        $response = $this->api->getLoan($id);
        return view('loans.show', ['loan' => $response['data'] ?? $response]);
    }

    public function approve(string $id)
    {
        $this->api->approveLoan($id);
        return back()->with('success', 'Préstamo aprobado');
    }

    public function reject(string $id)
    {
        $this->api->rejectLoan($id);
        return back()->with('success', 'Préstamo rechazado');
    }
}
