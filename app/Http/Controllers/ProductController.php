<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Look up a product by its barcode/SKU string.
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
