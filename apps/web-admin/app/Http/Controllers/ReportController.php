<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    protected ApiClient $api;

    public function __construct()
    {
        $this->api = new ApiClient();
    }

    public function index()
    {
        $response = $this->api->getReports();
        return view('reports.index', ['reports' => $response['data'] ?? []]);
    }

    public function generate(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:dues,transactions,loans,members',
            'format' => 'required|in:PDF,EXCEL',
            'dateFrom' => 'nullable|date',
            'dateTo' => 'nullable|date',
        ]);

        $this->api->generateReport($data);
        return back()->with('success', 'Reporte en generación');
    }
}
