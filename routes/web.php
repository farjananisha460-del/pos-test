<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AIController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect home to dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth'])->group(function () {
    // Analytics Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // POS Checkout Terminal
    Route::get('/pos', [POSController::class, 'index'])->name('pos');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');

    // Sales History logs
    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');

    // Catalog: Products & Categories
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::get('/products/scan', [ProductController::class, 'scan'])->name('products.scan');

    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Inventory audit, alerts, corrections
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');

    // Customer Loyalty CRM
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    // Supplier Logistics
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

    // Reports export CSV
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');

    // AI Predictive Analytics
    Route::get('/ai', [AIController::class, 'index'])->name('ai.index');

    // Settings page
    Route::get('/settings', function () {
        return Inertia::render('Settings/Index');
    })->name('settings.index');
});

require __DIR__.'/auth.php';
