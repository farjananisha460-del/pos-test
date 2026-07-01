<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Coupon;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Store a newly created order in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'coupon_code' => ['nullable', 'string', 'exists:coupons,code'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'payment_method' => ['required', 'string'], // cash, card, bkash, nagad, rocket, bank_transfer, gift_card
            'cash_received' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string'],
        ]);

        try {
            $order = DB::transaction(function () use ($request) {
                $subtotal = 0;
                $lineItemsToCreate = [];

                // Step 1: Lock products and validate stock/totals
                foreach ($request->input('items') as $itemData) {
                    $product = Product::lockForUpdate()->findOrFail($itemData['product_id']);

                    // Verify stock levels
                    if ($product->stock_quantity < $itemData['quantity']) {
                        throw ValidationException::withMessages([
                            'cart' => "Insufficient stock for product '{$product->name}'. Available: {$product->stock_quantity}, Requested: {$itemData['quantity']}."
                        ]);
                    }

                    // Decrement stock
                    $product->decrement('stock_quantity', $itemData['quantity']);

                    $itemSubtotal = $product->retail_price * $itemData['quantity'];
                    $subtotal += $itemSubtotal;

                    // Queue line item details
                    $lineItemsToCreate[] = [
                        'product_id' => $product->id,
                        'quantity' => $itemData['quantity'],
                        'historical_unit_price' => $product->retail_price,
                    ];
                }

                // Step 2: Validate coupon
                $discount = 0;
                $couponId = null;
                if ($request->filled('coupon_code')) {
                    $coupon = Coupon::where('code', $request->input('coupon_code'))->first();
                    if ($coupon && $coupon->isValid()) {
                        $discount = $coupon->calculateDiscount($subtotal);
                        $couponId = $coupon->id;
                    } else {
                        throw ValidationException::withMessages([
                            'coupon_code' => 'The coupon code is either expired or inactive.'
                        ]);
                    }
                }

                $tax = $subtotal * 0.10; // 10% default tax rate
                $grandTotal = max(0, ($subtotal + $tax) - $discount);
                
                $cashReceived = null;
                $changeGiven = null;

                if ($request->input('payment_method') === 'cash') {
                    $cashReceived = (float) $request->input('cash_received', 0);
                    if ($cashReceived < $grandTotal) {
                        throw ValidationException::withMessages([
                            'cash_received' => "Received cash (\${$cashReceived}) must be greater than or equal to grand total (\${$grandTotal})."
                        ]);
                    }
                    $changeGiven = $cashReceived - $grandTotal;
                }

                // Step 3: Create Order
                $invoiceNumber = 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6));

                $order = Order::create([
                    'invoice_number' => $invoiceNumber,
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'discount' => $discount,
                    'grand_total' => $grandTotal,
                    'payment_method' => $request->input('payment_method'),
                    'cash_received' => $cashReceived,
                    'change_given' => $changeGiven,
                    'customer_id' => $request->input('customer_id'),
                    'coupon_id' => $couponId,
                    'cashier_id' => $request->user()->id,
                ]);

                // Step 4: Create Order Items and log Stock History
                foreach ($lineItemsToCreate as $lineItem) {
                    $order->items()->create($lineItem);

                    StockHistory::create([
                        'product_id' => $lineItem['product_id'],
                        'change_quantity' => -$lineItem['quantity'],
                        'type' => 'sale',
                        'remarks' => "Sale checkout invoice #{$invoiceNumber}"
                    ]);
                }

                // Step 5: Update Customer Loyalty Points
                if ($request->filled('customer_id')) {
                    $customer = Customer::findOrFail($request->input('customer_id'));
                    // Add 1 reward point per $10 spent
                    $pointsEarned = floor($grandTotal / 10);
                    if ($pointsEarned > 0) {
                        $customer->increment('reward_points', $pointsEarned);
                        // Update membership level based on points
                        if ($customer->reward_points >= 500) {
                            $customer->update(['membership_level' => 'Platinum']);
                        } elseif ($customer->reward_points >= 300) {
                            $customer->update(['membership_level' => 'Gold']);
                        } elseif ($customer->reward_points >= 100) {
                            $customer->update(['membership_level' => 'Silver']);
                        }
                    }
                }

                return $order;
            });

            // Load relations for receipt
            $order->load(['items.product', 'cashier', 'customer']);

            return redirect()->back()->with('success', 'Sale processed successfully.')->with('last_order', $order);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'An error occurred while processing the transaction: ' . $e->getMessage()
            ]);
        }
    }
}
