<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
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
            'discount' => ['required', 'numeric', 'min:0'],
            'tax' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'in:cash,card'],
            'cash_received' => ['nullable', 'numeric', 'required_if:payment_method,cash'],
        ]);

        try {
            $order = DB::transaction(function () use ($request) {
                $subtotal = 0;
                $lineItemsToCreate = [];

                // Step 1: Lock products and validate stock/totals
                foreach ($request->input('items') as $itemData) {
                    // Lock the row for update to prevent race conditions
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

                // Step 2: Validate totals matching math
                $discount = (float) $request->input('discount');
                $tax = (float) $request->input('tax');
                $grandTotal = max(0, ($subtotal + $tax) - $discount);
                
                $cashReceived = null;
                $changeGiven = null;

                if ($request->input('payment_method') === 'cash') {
                    $cashReceived = (float) $request->input('cash_received');
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
                    'cashier_id' => $request->user()->id,
                ]);

                // Step 4: Create Order Items
                foreach ($lineItemsToCreate as $lineItem) {
                    $order->items()->create($lineItem);
                }

                return $order;
            });

            // Load relations to return with the order for receipt printing
            $order->load(['items.product', 'cashier']);

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
