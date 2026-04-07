<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;
use Illuminate\Http\Request;

class BenefitController extends Controller
{
    protected ApiClient $api;

    public function __construct()
    {
        $this->api = new ApiClient();
    }

    public function index()
    {
        $response = $this->api->getBenefits();
        return view('benefits.index', ['benefits' => $response['data'] ?? []]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|min:3',
            'description' => 'nullable',
            'category' => 'required',
            'amount' => 'nullable|numeric',
            'maxAmount' => 'nullable|numeric',
            'requiresApproval' => 'boolean',
        ]);

        $this->api->createBenefit($data);
        return redirect()->route('benefits.index')->with('success', 'Beneficio creado');
    }

    public function requests(Request $request)
    {
        $params = array_filter([
            'status' => $request->get('status', 'PENDING'),
            'page' => $request->get('page', 1),
        ]);

        $response = $this->api->getBenefitRequests($params);

        return view('benefits.requests', [
            'requests' => $response['data'] ?? [],
            'meta' => $response['meta'] ?? null,
        ]);
    }

    public function approve(string $id)
    {
        $this->api->approveBenefitRequest($id);
        return back()->with('success', 'Solicitud aprobada');
    }

    public function reject(Request $request, string $id)
    {
        $this->api->rejectBenefitRequest($id, $request->get('reason', ''));
        return back()->with('success', 'Solicitud rechazada');
    }
}
