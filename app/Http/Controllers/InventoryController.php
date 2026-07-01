<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Display low stock alerts and stock history logs.
     */
    public function index(Request $request): Response
    {
        $lowStockProducts = Product::where('stock_quantity', '<', 10)
            ->with('category:id,name')
            ->orderBy('stock_quantity')
            ->get();

        $historyQuery = StockHistory::with('product:id,name,sku,retail_price');

        if ($request->filled('type')) {
            $historyQuery->where('type', $request->input('type'));
        }

        $stockHistory = $historyQuery->orderByDesc('created_at')->limit(30)->get();

        return Inertia::render('Inventory/Index', [
            'lowStock' => $lowStockProducts,
            'history' => $stockHistory,
            'filters' => $request->only(['type'])
        ]);
    }

    /**
     * Perform a manual stock correction or restock log.
     */
    public function adjust(Request $request)
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer'],
            'type' => ['required', 'in:restock,adjustment'],
            'remarks' => ['nullable', 'string', 'max:255']
        ]);

        $product = Product::findOrFail($request->input('product_id'));
        $qty = $request->input('quantity');

        // Apply changes
        $product->increment('stock_quantity', $qty);

        // Record history
        StockHistory::create([
            'product_id' => $product->id,
            'change_quantity' => $qty,
            'type' => $request->input('type'),
            'remarks' => $request->input('remarks') ?? 'Manual stock adjustment'
        ]);

        return redirect()->back()->with('success', 'Stock updated successfully.');
    }
}
