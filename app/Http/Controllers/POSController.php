<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class POSController extends Controller
{
    /**
     * Render the POS checkout grid terminal.
     */
    public function index(Request $request): Response
    {
        $categories = Category::select('id', 'name', 'slug')->get();
        
        $products = Product::with('category:id,name,slug')
            ->select('id', 'category_id', 'sku', 'name', 'cost_price', 'retail_price', 'stock_quantity')
            ->get();

        $customers = Customer::select('id', 'name', 'phone', 'reward_points', 'membership_level')->get();
        $coupons = Coupon::where('active', true)->where('expiry_date', '>=', date('Y-m-d'))->get();

        return Inertia::render('POS', [
            'categories' => $categories,
            'products' => $products,
            'customers' => $customers,
            'coupons' => $coupons,
        ]);
    }
}
