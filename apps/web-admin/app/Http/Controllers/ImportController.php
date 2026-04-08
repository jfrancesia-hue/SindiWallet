<?php

namespace App\Http\Controllers;

use App\Services\ApiClient;
use Illuminate\Http\Request;

class ImportController extends Controller
{
    protected ApiClient $api;

    public function __construct()
    {
        $this->api = new ApiClient();
    }

    public function index()
    {
        $response = $this->api->getImportsList();

        return view('imports.index', [
            'imports' => $response['data'] ?? [],
        ]);
    }

    public function create()
    {
        return view('imports.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:USERS,DUES,MERCHANTS',
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $request->file('file');
        $csvContent = file_get_contents($file->getRealPath());
        $csvBase64 = base64_encode($csvContent);

        $response = $this->api->createImport([
            'type' => $request->type,
            'fileName' => $file->getClientOriginalName(),
            'csvBase64' => $csvBase64,
        ]);

        return redirect()->route('imports.index')
            ->with('success', "Importación iniciada: {$file->getClientOriginalName()}");
    }

    public function show(string $id)
    {
        $response = $this->api->getImportDetail($id);

        return view('imports.show', [
            'import' => $response['data'] ?? [],
        ]);
    }
}
