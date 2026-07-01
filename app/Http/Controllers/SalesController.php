<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    /**
     * Render the sales history and details logs.
     */
    public function index(Request $request): Response
    {
        $query = Order::with(['cashier:id,name', 'customer:id,name', 'items.product']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('invoice_number', 'like', "%{$search}%")
                ->orWhereHas('customer', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->input('payment_method'));
        }

        $sales = $query->orderByDesc('created_at')->get();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'filters' => $request->only(['search', 'payment_method'])
        ]);
    }
}
