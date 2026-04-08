<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;
use Illuminate\Http\Request;

class AuditController extends Controller
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
            'limit' => 50,
            'userId' => $request->get('userId'),
            'action' => $request->get('action'),
            'entity' => $request->get('entity'),
            'dateFrom' => $request->get('dateFrom'),
            'dateTo' => $request->get('dateTo'),
        ]);

        $response = $this->api->getAuditLog($params);

        return view('audit.index', [
            'logs' => $response['data']['data'] ?? [],
            'meta' => $response['data']['meta'] ?? [],
            'filters' => $params,
        ]);
    }
}
