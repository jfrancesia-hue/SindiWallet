<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;

class ApiClient
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(env('API_URL', 'http://localhost:3000'), '/') . '/api/v1';
    }

    protected function request()
    {
        $token = Session::get('access_token');
        $http = Http::baseUrl($this->baseUrl)
            ->acceptJson()
            ->timeout(30);

        if ($token) {
            $http = $http->withToken($token);
        }

        return $http;
    }

    // Auth
    public function login(string $email, string $password): array
    {
        $response = $this->request()->post('/auth/login', [
            'email' => $email,
            'password' => $password,
        ]);
        return $response->json();
    }

    public function register(array $data): array
    {
        $response = $this->request()->post('/auth/register', $data);
        return $response->json();
    }

    // Organizations
    public function getOrganizations(int $page = 1, int $limit = 20): array
    {
        return $this->request()->get('/organizations', compact('page', 'limit'))->json();
    }

    public function getOrganization(string $id): array
    {
        return $this->request()->get("/organizations/{$id}")->json();
    }

    public function createOrganization(array $data): array
    {
        return $this->request()->post('/organizations', $data)->json();
    }

    public function updateOrganization(string $id, array $data): array
    {
        return $this->request()->patch("/organizations/{$id}", $data)->json();
    }

    public function updateBranding(string $id, array $data): array
    {
        return $this->request()->patch("/organizations/{$id}/branding", $data)->json();
    }

    public function getOrganizationStats(string $id): array
    {
        return $this->request()->get("/organizations/{$id}/stats")->json();
    }

    // Users
    public function getUsers(array $params = []): array
    {
        return $this->request()->get('/users', $params)->json();
    }

    public function getUser(string $id): array
    {
        return $this->request()->get("/users/{$id}")->json();
    }

    public function createUser(array $data): array
    {
        return $this->request()->post('/users', $data)->json();
    }

    public function updateUser(string $id, array $data): array
    {
        return $this->request()->patch("/users/{$id}", $data)->json();
    }

    public function updateKyc(string $id, array $data): array
    {
        return $this->request()->patch("/users/{$id}/kyc", $data)->json();
    }

    public function deleteUser(string $id): array
    {
        return $this->request()->delete("/users/{$id}")->json();
    }

    public function importCsv(string $csv): array
    {
        return $this->request()->post('/users/import-csv', ['csv' => $csv])->json();
    }

    public function getImportJobs(int $page = 1): array
    {
        return $this->request()->get('/users/import-jobs', ['page' => $page])->json();
    }

    // Wallets
    public function getWallets(array $params = []): array
    {
        return $this->request()->get('/wallets', $params)->json();
    }

    public function getWallet(string $id): array
    {
        return $this->request()->get("/wallets/{$id}")->json();
    }

    // Transactions
    public function getTransactions(array $params = []): array
    {
        return $this->request()->get('/transactions', $params)->json();
    }

    public function getTransaction(string $id): array
    {
        return $this->request()->get("/transactions/{$id}")->json();
    }

    // Dues
    public function getDues(): array
    {
        return $this->request()->get('/dues')->json();
    }

    public function createDue(array $data): array
    {
        return $this->request()->post('/dues', $data)->json();
    }

    public function getDuePayments(array $params = []): array
    {
        return $this->request()->get('/dues/payments', $params)->json();
    }

    public function reconcileDues(string $csv): array
    {
        return $this->request()->post('/dues/reconcile', ['csv' => $csv])->json();
    }

    // Benefits
    public function getBenefits(): array
    {
        return $this->request()->get('/benefits')->json();
    }

    public function createBenefit(array $data): array
    {
        return $this->request()->post('/benefits', $data)->json();
    }

    public function getBenefitRequests(array $params = []): array
    {
        return $this->request()->get('/benefits/requests', $params)->json();
    }

    public function approveBenefitRequest(string $id): array
    {
        return $this->request()->patch("/benefits/requests/{$id}/approve")->json();
    }

    public function rejectBenefitRequest(string $id, string $reason): array
    {
        return $this->request()->patch("/benefits/requests/{$id}/reject", ['reviewNotes' => $reason])->json();
    }

    // Loans
    public function getLoans(array $params = []): array
    {
        return $this->request()->get('/loans', $params)->json();
    }

    public function getLoan(string $id): array
    {
        return $this->request()->get("/loans/{$id}")->json();
    }

    public function approveLoan(string $id): array
    {
        return $this->request()->patch("/loans/{$id}/approve")->json();
    }

    public function rejectLoan(string $id): array
    {
        return $this->request()->patch("/loans/{$id}/reject")->json();
    }

    // Merchants
    public function getMerchants(array $params = []): array
    {
        return $this->request()->get('/merchants', $params)->json();
    }

    public function createMerchant(array $data): array
    {
        return $this->request()->post('/merchants', $data)->json();
    }

    public function updateMerchant(string $id, array $data): array
    {
        return $this->request()->patch("/merchants/{$id}", $data)->json();
    }

    // Reports
    public function generateReport(array $data): array
    {
        return $this->request()->post('/reports/generate', $data)->json();
    }

    public function getReports(): array
    {
        return $this->request()->get('/reports')->json();
    }

    // Notifications
    public function sendNotification(array $data): array
    {
        return $this->request()->post('/notifications/send', $data)->json();
    }
}
