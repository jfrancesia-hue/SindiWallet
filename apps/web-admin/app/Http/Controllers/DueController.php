<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;
use Illuminate\Http\Request;

class DueController extends Controller
{
    protected ApiClient $api;

    public function __construct()
    {
        $this->api = new ApiClient();
    }

    public function index()
    {
        $response = $this->api->getDues();
        return view('dues.index', ['dues' => $response['data'] ?? []]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|min:3',
            'description' => 'nullable',
            'amount' => 'required|numeric|min:0',
            'percentOfSalary' => 'nullable|numeric|min:0|max:1',
            'frequency' => 'required|in:MONTHLY,QUARTERLY,ANNUAL',
            'isRetention' => 'boolean',
        ]);

        $this->api->createDue($data);
        return redirect()->route('dues.index')->with('success', 'Cuota creada');
    }

    public function payments(Request $request)
    {
        $params = array_filter([
            'period' => $request->get('period', date('Y-m')),
            'page' => $request->get('page', 1),
        ]);

        $response = $this->api->getDuePayments($params);

        return view('dues.payments', [
            'payments' => $response['data'] ?? [],
            'meta' => $response['meta'] ?? null,
            'period' => $params['period'],
        ]);
    }

    public function reconciliation()
    {
        return view('dues.reconciliation');
    }

    public function reconcile(Request $request)
    {
        $request->validate(['csv_file' => 'required|file|mimes:csv,txt']);
        $csv = file_get_contents($request->file('csv_file')->getRealPath());
        $response = $this->api->reconcileDues($csv);

        return view('dues.reconciliation', ['result' => $response['data'] ?? $response]);
    }
}
