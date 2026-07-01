<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): Response
    {
        $query = Supplier::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('company', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        }

        $suppliers = $query->orderBy('name')->get();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Store a newly created supplier.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'company' => ['nullable', 'string', 'max:255'],
            'balance_due' => ['nullable', 'numeric', 'min:0'],
        ]);

        Supplier::create($validated);

        return redirect()->back()->with('success', 'Supplier profile registered.');
    }

    /**
     * Update the specified supplier.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'company' => ['nullable', 'string', 'max:255'],
            'balance_due' => ['nullable', 'numeric', 'min:0'],
        ]);

        $supplier->update($validated);

        return redirect()->back()->with('success', 'Supplier details updated.');
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return redirect()->back()->with('success', 'Supplier profile deleted.');
    }
}
