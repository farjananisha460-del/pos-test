<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Render the enterprise analytics dashboard.
     */
    public function index(Request $request): Response
    {
        // 1. Fetch Metrics Cards
        $today = date('Y-m-d');
        $todaySales = Order::whereDate('created_at', $today)->sum('grand_total');
        $todayOrders = Order::whereDate('created_at', $today)->count();
        $totalCustomers = Customer::count();
        $totalProducts = Product::count();
        $totalRevenue = Order::sum('grand_total');
        $totalExpenses = Expense::sum('amount');
        $lowStockCount = Product::where('stock_quantity', '<', 10)->where('stock_quantity', '>', 0)->count();
        $outOfStockCount = Product::where('stock_quantity', '<=', 0)->count();

        // Calculate Profit: grand_total - (cost_price * quantity) of all order items
        // Since sqlite doesn't have complex joints easily, we fetch items and do math or write join:
        $totalCost = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select(DB::raw('SUM(order_items.quantity * products.cost_price) as total_cost'))
            ->first()->total_cost ?? 0;
            
        $totalProfit = max(0, $totalRevenue - $totalCost);

        // 2. Fetch Chart Data (Last 7 Days Daily Sales)
        $dailySalesRaw = Order::select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(grand_total) as total'))
            ->where('created_at', '>=', date('Y-m-d', strtotime('-6 days')))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();
            
        $dailySales = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = date('Y-m-d', strtotime("-$i days"));
            $match = $dailySalesRaw->firstWhere('date', $d);
            $dailySales[] = [
                'label' => date('D, M d', strtotime($d)),
                'value' => $match ? (float) $match->total : 0.00
            ];
        }

        // 3. Payment Methods Distribution
        $paymentDistribution = Order::select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(grand_total) as total'))
            ->groupBy('payment_method')
            ->get()
            ->map(fn($item) => [
                'method' => ucfirst($item->payment_method),
                'count' => $item->count,
                'total' => round($item->total, 2)
            ]);

        // 4. Top Selling Products
        $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as quantity_sold'))
            ->with('product:id,name,retail_price')
            ->groupBy('product_id')
            ->orderByDesc('quantity_sold')
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'name' => $item->product ? $item->product->name : 'Unknown Product',
                'quantity' => (int) $item->quantity_sold,
                'revenue' => $item->product ? round($item->quantity_sold * $item->product->retail_price, 2) : 0
            ]);

        // 5. Top Categories
        $topCategories = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name as category_name', DB::raw('SUM(order_items.quantity) as total_qty'))
            ->groupBy('categories.name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // 6. Recent Sales Activity log
        $recentSales = Order::with(['cashier:id,name', 'customer:id,name'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($order) => [
                'id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'grand_total' => round($order->grand_total, 2),
                'payment_method' => $order->payment_method,
                'cashier_name' => $order->cashier ? $order->cashier->name : 'Staff',
                'customer_name' => $order->customer ? $order->customer->name : 'Walk-in Customer',
                'time_ago' => $order->created_at->diffForHumans()
            ]);

        // 7. Low Stock items
        $lowStockProducts = Product::where('stock_quantity', '<', 10)
            ->with('category:id,name')
            ->orderBy('stock_quantity')
            ->limit(6)
            ->get();

        return Inertia::render('Dashboard', [
            'metrics' => [
                'today_sales' => round($todaySales, 2),
                'today_orders' => $todayOrders,
                'total_customers' => $totalCustomers,
                'total_products' => $totalProducts,
                'total_revenue' => round($totalRevenue, 2),
                'total_profit' => round($totalProfit, 2),
                'total_expenses' => round($totalExpenses, 2),
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
            ],
            'charts' => [
                'daily_sales' => $dailySales,
                'payment_distribution' => $paymentDistribution,
                'top_products' => $topProducts,
                'top_categories' => $topCategories,
            ],
            'recent_sales' => $recentSales,
            'low_stock_products' => $lowStockProducts,
        ]);
    }
}
