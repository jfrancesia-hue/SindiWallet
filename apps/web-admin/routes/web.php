<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\DueController;
use App\Http\Controllers\BenefitController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\MerchantController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\NotificationController;

// Auth (public)
Route::get('/login', [LoginController::class, 'showLogin'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Redirect root to dashboard
Route::get('/', fn() => redirect()->route('dashboard'));

// Protected routes
Route::middleware([\App\Http\Middleware\SupabaseAuth::class])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Users
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/import', [UserController::class, 'importForm'])->name('users.import');
    Route::post('/users/import', [UserController::class, 'importCsv'])->name('users.import.process');
    Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');
    Route::get('/users/{id}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::patch('/users/{id}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::patch('/users/{id}/kyc', [UserController::class, 'updateKyc'])->name('users.kyc');

    // Organizations (SUPERADMIN)
    Route::middleware([\App\Http\Middleware\EnsureRole::class . ':SUPERADMIN'])->group(function () {
        Route::get('/organizations', [OrganizationController::class, 'index'])->name('organizations.index');
        Route::get('/organizations/create', [OrganizationController::class, 'create'])->name('organizations.create');
        Route::post('/organizations', [OrganizationController::class, 'store'])->name('organizations.store');
        Route::get('/organizations/{id}/edit', [OrganizationController::class, 'edit'])->name('organizations.edit');
        Route::patch('/organizations/{id}', [OrganizationController::class, 'update'])->name('organizations.update');
        Route::patch('/organizations/{id}/branding', [OrganizationController::class, 'updateBranding'])->name('organizations.branding');
    });

    // Transactions
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transactions/{id}', [TransactionController::class, 'show'])->name('transactions.show');

    // Dues
    Route::get('/dues', [DueController::class, 'index'])->name('dues.index');
    Route::post('/dues', [DueController::class, 'store'])->name('dues.store');
    Route::get('/dues/payments', [DueController::class, 'payments'])->name('dues.payments');
    Route::get('/dues/reconciliation', [DueController::class, 'reconciliation'])->name('dues.reconciliation');
    Route::post('/dues/reconciliation', [DueController::class, 'reconcile'])->name('dues.reconcile');

    // Benefits
    Route::get('/benefits', [BenefitController::class, 'index'])->name('benefits.index');
    Route::post('/benefits', [BenefitController::class, 'store'])->name('benefits.store');
    Route::get('/benefits/requests', [BenefitController::class, 'requests'])->name('benefits.requests');
    Route::patch('/benefits/requests/{id}/approve', [BenefitController::class, 'approve'])->name('benefits.approve');
    Route::patch('/benefits/requests/{id}/reject', [BenefitController::class, 'reject'])->name('benefits.reject');

    // Loans
    Route::get('/loans', [LoanController::class, 'index'])->name('loans.index');
    Route::get('/loans/{id}', [LoanController::class, 'show'])->name('loans.show');
    Route::patch('/loans/{id}/approve', [LoanController::class, 'approve'])->name('loans.approve');
    Route::patch('/loans/{id}/reject', [LoanController::class, 'reject'])->name('loans.reject');

    // Merchants
    Route::get('/merchants', [MerchantController::class, 'index'])->name('merchants.index');
    Route::post('/merchants', [MerchantController::class, 'store'])->name('merchants.store');
    Route::patch('/merchants/{id}', [MerchantController::class, 'update'])->name('merchants.update');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('/reports/generate', [ReportController::class, 'generate'])->name('reports.generate');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/send', [NotificationController::class, 'send'])->name('notifications.send');
});
