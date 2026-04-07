<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;
use Illuminate\Http\Request;

class UserController extends Controller
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
            'role' => $request->get('role'),
            'search' => $request->get('search'),
            'isActive' => $request->get('isActive'),
        ]);

        $response = $this->api->getUsers($params);

        return view('users.index', [
            'users' => $response['data'] ?? [],
            'meta' => $response['meta'] ?? null,
            'filters' => $request->only(['role', 'search', 'isActive']),
        ]);
    }

    public function create()
    {
        return view('users.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'firstName' => 'required|min:2',
            'lastName' => 'required|min:2',
            'dni' => 'required|regex:/^\d{7,8}$/',
            'phone' => 'nullable',
            'cuit' => 'nullable',
            'role' => 'nullable|in:ADMIN,AFFILIATE,MERCHANT',
            'employerName' => 'nullable',
            'employerCuit' => 'nullable',
            'salary' => 'nullable|numeric',
            'memberSince' => 'nullable|date',
        ]);

        $response = $this->api->createUser(array_filter($data));

        if ($response['success'] ?? false) {
            return redirect()->route('users.index')->with('success', 'Usuario creado correctamente');
        }

        return back()->withErrors(['error' => $response['error'] ?? 'Error al crear usuario'])->withInput();
    }

    public function show(string $id)
    {
        $response = $this->api->getUser($id);
        return view('users.show', ['user' => $response['data'] ?? $response]);
    }

    public function edit(string $id)
    {
        $response = $this->api->getUser($id);
        return view('users.edit', ['user' => $response['data'] ?? $response]);
    }

    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            'firstName' => 'nullable|min:2',
            'lastName' => 'nullable|min:2',
            'phone' => 'nullable',
            'address' => 'nullable|max:200',
            'city' => 'nullable|max:100',
            'province' => 'nullable|max:100',
            'postalCode' => 'nullable|max:10',
        ]);

        $response = $this->api->updateUser($id, array_filter($data));

        if ($response['success'] ?? false) {
            return redirect()->route('users.show', $id)->with('success', 'Usuario actualizado');
        }

        return back()->withErrors(['error' => $response['error'] ?? 'Error al actualizar'])->withInput();
    }

    public function destroy(string $id)
    {
        $this->api->deleteUser($id);
        return redirect()->route('users.index')->with('success', 'Usuario desactivado');
    }

    public function importForm()
    {
        return view('users.import');
    }

    public function importCsv(Request $request)
    {
        $request->validate(['csv_file' => 'required|file|mimes:csv,txt']);
        $csv = file_get_contents($request->file('csv_file')->getRealPath());
        $response = $this->api->importCsv($csv);

        return view('users.import', [
            'result' => $response['data'] ?? $response,
        ]);
    }

    public function updateKyc(Request $request, string $id)
    {
        $data = $request->validate([
            'status' => 'required|in:PENDING,IN_REVIEW,APPROVED,REJECTED',
        ]);

        $this->api->updateKyc($id, $data);
        return back()->with('success', 'Estado KYC actualizado');
    }
}
