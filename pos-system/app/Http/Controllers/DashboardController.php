<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Render the POS terminal dashboard.
     */
    public function index(Request $request): Response
    {
        $categories = Category::select('id', 'name', 'slug')->get();
        
        $products = Product::with('category:id,name,slug')
            ->select('id', 'category_id', 'sku', 'name', 'cost_price', 'retail_price', 'stock_quantity')
            ->get();

        return Inertia::render('Dashboard', [
            'categories' => $categories,
            'products' => $products,
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                ] : null,
            ]
        ]);
    }
}
