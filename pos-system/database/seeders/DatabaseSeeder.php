<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
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
        User::create([
            'name' => 'Admin Manager',
            'email' => 'admin@pos.local',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
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
        $products = [
            // Beverages
            [
                'category_slug' => 'beverages',
                'sku' => '8801111999',
                'name' => 'Coca-Cola Can 330ml',
                'cost_price' => 0.45,
                'retail_price' => 1.25,
                'stock_quantity' => 120,
            ],
            [
                'category_slug' => 'beverages',
                'sku' => '8801111888',
                'name' => 'Pepsi Bottle 500ml',
                'cost_price' => 0.60,
                'retail_price' => 1.75,
                'stock_quantity' => 85,
            ],
            [
                'category_slug' => 'beverages',
                'sku' => '8801111777',
                'name' => 'Monster Energy Drink',
                'cost_price' => 1.10,
                'retail_price' => 2.99,
                'stock_quantity' => 50,
            ],
            [
                'category_slug' => 'beverages',
                'sku' => '8801111666',
                'name' => 'Evian Spring Water 1L',
                'cost_price' => 0.75,
                'retail_price' => 2.20,
                'stock_quantity' => 60,
            ],

            // Bakery & Bread
            [
                'category_slug' => 'bakery-bread',
                'sku' => '7702222111',
                'name' => 'French Baguette',
                'cost_price' => 0.50,
                'retail_price' => 1.50,
                'stock_quantity' => 25,
            ],
            [
                'category_slug' => 'bakery-bread',
                'sku' => '7702222222',
                'name' => 'Whole Wheat Bread Loaf',
                'cost_price' => 1.20,
                'retail_price' => 2.80,
                'stock_quantity' => 30,
            ],
            [
                'category_slug' => 'bakery-bread',
                'sku' => '7702222333',
                'name' => 'Chocolate Croissant',
                'cost_price' => 0.70,
                'retail_price' => 1.99,
                'stock_quantity' => 15,
            ],

            // Snacks & Sweets
            [
                'category_slug' => 'snacks-sweets',
                'sku' => '6603333111',
                'name' => 'Lays Classic Potato Chips XL',
                'cost_price' => 1.40,
                'retail_price' => 3.49,
                'stock_quantity' => 45,
            ],
            [
                'category_slug' => 'snacks-sweets',
                'sku' => '6603333222',
                'name' => 'Doritos Nacho Cheese',
                'cost_price' => 1.50,
                'retail_price' => 3.50,
                'stock_quantity' => 40,
            ],
            [
                'category_slug' => 'snacks-sweets',
                'sku' => '6603333333',
                'name' => 'Snickers Chocolate Bar',
                'cost_price' => 0.40,
                'retail_price' => 1.10,
                'stock_quantity' => 200,
            ],
            [
                'category_slug' => 'snacks-sweets',
                'sku' => '6603333444',
                'name' => 'Oreo Cookies Pack',
                'cost_price' => 0.90,
                'retail_price' => 2.25,
                'stock_quantity' => 75,
            ],

            // Electronics
            [
                'category_slug' => 'electronics',
                'sku' => '5504444111',
                'name' => 'USB-C Charging Cable 2m',
                'cost_price' => 2.50,
                'retail_price' => 9.99,
                'stock_quantity' => 35,
            ],
            [
                'category_slug' => 'electronics',
                'sku' => '5504444222',
                'name' => 'Anker Power Bank 10k mAh',
                'cost_price' => 12.00,
                'retail_price' => 29.99,
                'stock_quantity' => 18,
            ],
            [
                'category_slug' => 'electronics',
                'sku' => '5504444333',
                'name' => 'Wireless Bluetooth Mouse',
                'cost_price' => 6.50,
                'retail_price' => 19.99,
                'stock_quantity' => 8, // Low stock indicator test
            ],

            // Personal Care
            [
                'category_slug' => 'personal-care',
                'sku' => '4405555111',
                'name' => 'Colgate Toothpaste 150g',
                'cost_price' => 1.10,
                'retail_price' => 3.49,
                'stock_quantity' => 50,
            ],
            [
                'category_slug' => 'personal-care',
                'sku' => '4405555222',
                'name' => 'Nivea Body Wash 250ml',
                'cost_price' => 1.80,
                'retail_price' => 4.99,
                'stock_quantity' => 22,
            ],
            [
                'category_slug' => 'personal-care',
                'sku' => '4405555333',
                'name' => 'Hand Sanitizer Gel 50ml',
                'cost_price' => 0.35,
                'retail_price' => 1.50,
                'stock_quantity' => 0, // Out of stock test
            ]
        ];

        foreach ($products as $prod) {
            $catSlug = $prod['category_slug'];
            unset($prod['category_slug']);
            $prod['category_id'] = $createdCategories[$catSlug]->id;
            Product::create($prod);
        }
    }
}
