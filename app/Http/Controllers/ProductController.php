<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of products and categories.
     */
    public function index(Request $request): Response
    {
        $query = Product::with('category:id,name');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%");
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }

        $products = $query->orderBy('name')->get();
        $categories = Category::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category'])
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'unique:products,sku', 'max:50'],
            'category_id' => ['required', 'exists:categories,id'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'retail_price' => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
        ]);

        Product::create($validated);

        return redirect()->back()->with('success', 'Product added successfully.');
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', "unique:products,sku,{$product->id}", 'max:50'],
            'category_id' => ['required', 'exists:categories,id'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'retail_price' => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
        ]);

        $product->update($validated);

        return redirect()->back()->with('success', 'Product details updated.');
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted successfully.');
    }

    /**
     * Look up a product by its barcode/SKU string (API for scanners).
     */
    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'sku' => ['required', 'string'],
        ]);

        $product = Product::with('category:id,name,slug')
            ->where('sku', $request->query('sku'))
            ->first();

        if (!$product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'product' => $product,
        ]);
    }
}
