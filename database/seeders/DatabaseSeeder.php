<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Expense;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StockHistory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        $admin = User::create([
            'name' => 'Admin Manager',
            'email' => 'admin@pos.local',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $cashier = User::create([
            'name' => 'John Cashier',
            'email' => 'cashier@pos.local',
            'password' => Hash::make('password'),
            'role' => 'cashier',
        ]);

        // 2. Seed Categories
        $categories = [
            ['name' => 'Beverages', 'slug' => 'beverages'],
            ['name' => 'Bakery & Bread', 'slug' => 'bakery-bread'],
            ['name' => 'Snacks & Sweets', 'slug' => 'snacks-sweets'],
            ['name' => 'Electronics', 'slug' => 'electronics'],
            ['name' => 'Personal Care', 'slug' => 'personal-care'],
        ];

        $createdCategories = [];
        foreach ($categories as $cat) {
            $createdCategories[$cat['slug']] = Category::create($cat);
        }

        // 3. Seed Products
        $productsData = [
            ['category_slug' => 'beverages', 'sku' => '8801111999', 'name' => 'Coca-Cola Can 330ml', 'cost_price' => 0.45, 'retail_price' => 1.25, 'stock_quantity' => 120],
            ['category_slug' => 'beverages', 'sku' => '8801111888', 'name' => 'Pepsi Bottle 500ml', 'cost_price' => 0.60, 'retail_price' => 1.75, 'stock_quantity' => 85],
            ['category_slug' => 'beverages', 'sku' => '8801111777', 'name' => 'Monster Energy Drink', 'cost_price' => 1.10, 'retail_price' => 2.99, 'stock_quantity' => 50],
            ['category_slug' => 'beverages', 'sku' => '8801111666', 'name' => 'Evian Spring Water 1L', 'cost_price' => 0.75, 'retail_price' => 2.20, 'stock_quantity' => 60],
            ['category_slug' => 'bakery-bread', 'sku' => '7702222111', 'name' => 'French Baguette', 'cost_price' => 0.50, 'retail_price' => 1.50, 'stock_quantity' => 25],
            ['category_slug' => 'bakery-bread', 'sku' => '7702222222', 'name' => 'Whole Wheat Bread Loaf', 'cost_price' => 1.20, 'retail_price' => 2.80, 'stock_quantity' => 30],
            ['category_slug' => 'bakery-bread', 'sku' => '7702222333', 'name' => 'Chocolate Croissant', 'cost_price' => 0.70, 'retail_price' => 1.99, 'stock_quantity' => 15],
            ['category_slug' => 'snacks-sweets', 'sku' => '6603333111', 'name' => 'Lays Potato Chips XL', 'cost_price' => 1.40, 'retail_price' => 3.49, 'stock_quantity' => 45],
            ['category_slug' => 'snacks-sweets', 'sku' => '6603333222', 'name' => 'Doritos Nacho Cheese', 'cost_price' => 1.50, 'retail_price' => 3.50, 'stock_quantity' => 40],
            ['category_slug' => 'snacks-sweets', 'sku' => '6603333333', 'name' => 'Snickers Chocolate Bar', 'cost_price' => 0.40, 'retail_price' => 1.10, 'stock_quantity' => 200],
            ['category_slug' => 'snacks-sweets', 'sku' => '6603333444', 'name' => 'Oreo Cookies Pack', 'cost_price' => 0.90, 'retail_price' => 2.25, 'stock_quantity' => 75],
            ['category_slug' => 'electronics', 'sku' => '5504444111', 'name' => 'USB-C Charging Cable 2m', 'cost_price' => 2.50, 'retail_price' => 9.99, 'stock_quantity' => 35],
            ['category_slug' => 'electronics', 'sku' => '5504444222', 'name' => 'Anker Power Bank 10k', 'cost_price' => 12.00, 'retail_price' => 29.99, 'stock_quantity' => 18],
            ['category_slug' => 'electronics', 'sku' => '5504444333', 'name' => 'Wireless Bluetooth Mouse', 'cost_price' => 6.50, 'retail_price' => 19.99, 'stock_quantity' => 8],
            ['category_slug' => 'personal-care', 'sku' => '4405555111', 'name' => 'Colgate Toothpaste 150g', 'cost_price' => 1.10, 'retail_price' => 3.49, 'stock_quantity' => 50],
            ['category_slug' => 'personal-care', 'sku' => '4405555222', 'name' => 'Nivea Body Wash 250ml', 'cost_price' => 1.80, 'retail_price' => 4.99, 'stock_quantity' => 22],
            ['category_slug' => 'personal-care', 'sku' => '4405555333', 'name' => 'Hand Sanitizer Gel 50ml', 'cost_price' => 0.35, 'retail_price' => 1.50, 'stock_quantity' => 12],
        ];

        $products = [];
        foreach ($productsData as $prod) {
            $catSlug = $prod['category_slug'];
            unset($prod['category_slug']);
            $prod['category_id'] = $createdCategories[$catSlug]->id;
            $products[] = Product::create($prod);
        }

        // 4. Seed Customers
        $customers = [
            Customer::create(['name' => 'Arafat Rahman', 'email' => 'arafat@gmail.com', 'phone' => '01711223344', 'address' => 'Dhaka, Bangladesh', 'reward_points' => 350, 'membership_level' => 'Gold', 'balance_due' => 0.00]),
            Customer::create(['name' => 'Tania Sultana', 'email' => 'tania@yahoo.com', 'phone' => '01822334455', 'address' => 'Chittagong, Bangladesh', 'reward_points' => 150, 'membership_level' => 'Silver', 'balance_due' => 50.00]),
            Customer::create(['name' => 'Imran Khan', 'email' => 'imran@hotmail.com', 'phone' => '01933445566', 'address' => 'Sylhet, Bangladesh', 'reward_points' => 800, 'membership_level' => 'Platinum', 'balance_due' => 0.00]),
            Customer::create(['name' => 'Sadia Islam', 'email' => 'sadia@gmail.com', 'phone' => '01544556677', 'address' => 'Khulna, Bangladesh', 'reward_points' => 20, 'membership_level' => 'Bronze', 'balance_due' => 120.00]),
        ];

        // 5. Seed Suppliers
        $suppliers = [
            Supplier::create(['name' => 'Unilever Bangladesh', 'email' => 'supply@unilever.com.bd', 'phone' => '09612345678', 'company' => 'Unilever BD Ltd.', 'balance_due' => 0.00]),
            Supplier::create(['name' => 'Transcom Electronics', 'email' => 'info@transcom.com', 'phone' => '01713045612', 'company' => 'Transcom Group', 'balance_due' => 450.00]),
            Supplier::create(['name' => 'Pran RFL Group', 'email' => 'sales@prangroup.com', 'phone' => '029881792', 'company' => 'Pran Foods Ltd.', 'balance_due' => 0.00]),
        ];

        // 6. Seed Coupons
        $coupons = [
            Coupon::create(['code' => 'SAVE10', 'type' => 'percent', 'value' => 10.00, 'expiry_date' => date('Y-m-d', strtotime('+3 months')), 'active' => true]),
            Coupon::create(['code' => 'FLAT5', 'type' => 'fixed', 'value' => 5.00, 'expiry_date' => date('Y-m-d', strtotime('+2 months')), 'active' => true]),
            Coupon::create(['code' => 'EXPIRED20', 'type' => 'percent', 'value' => 20.00, 'expiry_date' => date('Y-m-d', strtotime('-1 day')), 'active' => true]),
        ];

        // 7. Seed Expenses over the last 30 days
        $expenseCategories = ['Rent', 'Electricity', 'Internet', 'Salaries', 'Supplies', 'Marketing'];
        for ($i = 30; $i >= 0; $i--) {
            if (rand(1, 3) === 1) { // Seed expense every ~3 days
                Expense::create([
                    'amount' => rand(50, 300),
                    'description' => 'Office Utility / Service payment',
                    'category' => $expenseCategories[array_rand($expenseCategories)],
                    'date' => date('Y-m-d', strtotime("-$i days")),
                ]);
            }
        }

        // 8. Seed Orders and OrderItems over the last 30 days (for Analytics Chart data)
        $paymentMethods = ['cash', 'card', 'bkash', 'nagad', 'rocket', 'bank_transfer', 'gift_card'];
        for ($day = 30; $day >= 0; $day--) {
            $numOrders = rand(2, 6); // 2 to 6 orders per day
            $date = date('Y-m-d H:i:s', strtotime("-$day days " . rand(9, 21) . ":" . rand(10, 59) . ":" . rand(10, 59)));

            for ($ord = 0; $ord < $numOrders; $ord++) {
                $subtotal = 0;
                $lineItems = [];

                // Choose 1 to 4 random products
                $orderProducts = array_rand($products, rand(1, 4));
                if (!is_array($orderProducts)) {
                    $orderProducts = [$orderProducts];
                }

                foreach ($orderProducts as $prodIdx) {
                    $prod = $products[$prodIdx];
                    $qty = rand(1, 3);
                    $subtotal += $prod->retail_price * $qty;

                    $lineItems[] = [
                        'product_id' => $prod->id,
                        'quantity' => $qty,
                        'historical_unit_price' => $prod->retail_price,
                    ];
                }

                $discount = 0;
                $coupon = null;
                // 30% chance of applying a coupon
                if (rand(1, 10) <= 3) {
                    $coupon = $coupons[array_rand($coupons)];
                    if ($coupon->isValid()) {
                        $discount = $coupon->calculateDiscount($subtotal);
                    } else {
                        $coupon = null;
                    }
                }

                $tax = $subtotal * 0.10; // 10% tax
                $grandTotal = max(0, ($subtotal + $tax) - $discount);
                $paymentMethod = $paymentMethods[array_rand($paymentMethods)];

                $cashReceived = null;
                $changeGiven = null;
                if ($paymentMethod === 'cash') {
                    $cashReceived = ceil($grandTotal / 5) * 5; // Round to nearest 5
                    $changeGiven = $cashReceived - $grandTotal;
                }

                // Random customer association
                $customer = null;
                if (rand(1, 2) === 1) {
                    $customer = $customers[array_rand($customers)];
                    // Award points
                    $customer->increment('reward_points', floor($grandTotal / 10));
                }

                $order = Order::create([
                    'invoice_number' => 'INV-' . date('Ymd', strtotime($date)) . '-' . strtoupper(Str::random(6)),
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'discount' => $discount,
                    'grand_total' => $grandTotal,
                    'payment_method' => $paymentMethod,
                    'cash_received' => $cashReceived,
                    'change_given' => $changeGiven,
                    'customer_id' => $customer ? $customer->id : null,
                    'coupon_id' => $coupon ? $coupon->id : null,
                    'cashier_id' => rand(1, 2) === 1 ? $admin->id : $cashier->id,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);

                foreach ($lineItems as $item) {
                    $order->items()->create($item);

                    // Add to StockHistory
                    StockHistory::create([
                        'product_id' => $item['product_id'],
                        'change_quantity' => -$item['quantity'],
                        'type' => 'sale',
                        'remarks' => "Sale checkout invoice #{$order->invoice_number}",
                        'created_at' => $date,
                        'updated_at' => $date,
                    ]);
                }
            }
        }
    }
}
