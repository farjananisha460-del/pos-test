<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     */
    public function index(Request $request): Response
    {
        $query = Customer::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        }

        $customers = $query->orderBy('name')->get();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'balance_due' => ['nullable', 'numeric', 'min:0'],
        ]);

        Customer::create($validated);

        return redirect()->back()->with('success', 'Customer registered successfully.');
    }

    /**
     * Update the specified customer.
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'balance_due' => ['nullable', 'numeric', 'min:0'],
            'reward_points' => ['nullable', 'integer', 'min:0'],
        ]);

        $customer->update($validated);

        return redirect()->back()->with('success', 'Customer details updated successfully.');
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->back()->with('success', 'Customer profile deleted.');
    }
}
