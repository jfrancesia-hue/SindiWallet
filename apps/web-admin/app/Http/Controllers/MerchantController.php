<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;
use Illuminate\Http\Request;

class MerchantController extends Controller
{
    protected ApiClient $api;

    public function __construct()
    {
        $this->api = new ApiClient();
    }

    public function index()
    {
        $response = $this->api->getMerchants();
        return view('merchants.index', [
            'merchants' => $response['data'] ?? [],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'userId' => 'required',
            'businessName' => 'required|min:3',
            'cuit' => 'required',
            'category' => 'required',
            'address' => 'nullable',
            'phone' => 'nullable',
            'discountPercent' => 'nullable|numeric|min:0|max:100',
        ]);

        $this->api->createMerchant($data);
        return redirect()->route('merchants.index')->with('success', 'Comercio creado');
    }

    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            'businessName' => 'nullable|min:3',
            'category' => 'nullable',
            'address' => 'nullable',
            'phone' => 'nullable',
            'discountPercent' => 'nullable|numeric|min:0|max:100',
        ]);

        $this->api->updateMerchant($id, array_filter($data));
        return back()->with('success', 'Comercio actualizado');
    }
}
