<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    protected ApiClient $api;

    public function __construct()
    {
        $this->api = new ApiClient();
    }

    public function index()
    {
        $response = $this->api->getOrganizations();
        return view('organizations.index', [
            'organizations' => $response['data'] ?? [],
            'meta' => $response['meta'] ?? null,
        ]);
    }

    public function create()
    {
        return view('organizations.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|min:3|max:100',
            'slug' => 'required|min:3|max:50|regex:/^[a-z0-9-]+$/',
            'cuit' => 'required',
            'email' => 'nullable|email',
            'phone' => 'nullable',
            'address' => 'nullable|max:200',
            'website' => 'nullable|url',
        ]);

        $response = $this->api->createOrganization(array_filter($data));

        if ($response['success'] ?? false) {
            return redirect()->route('organizations.index')->with('success', 'Organización creada');
        }

        return back()->withErrors(['error' => $response['error'] ?? 'Error'])->withInput();
    }

    public function edit(string $id)
    {
        $response = $this->api->getOrganization($id);
        return view('organizations.edit', ['organization' => $response['data'] ?? $response]);
    }

    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            'name' => 'nullable|min:3|max:100',
            'email' => 'nullable|email',
            'phone' => 'nullable',
            'address' => 'nullable|max:200',
            'website' => 'nullable|url',
        ]);

        $this->api->updateOrganization($id, array_filter($data));
        return back()->with('success', 'Organización actualizada');
    }

    public function updateBranding(Request $request, string $id)
    {
        $data = $request->validate([
            'primaryColor' => 'nullable|regex:/^#[0-9A-Fa-f]{6}$/',
            'secondaryColor' => 'nullable|regex:/^#[0-9A-Fa-f]{6}$/',
            'accentColor' => 'nullable|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $this->api->updateBranding($id, array_filter($data));
        return back()->with('success', 'Branding actualizado');
    }
}
