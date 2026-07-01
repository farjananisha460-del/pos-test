<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Expense;
use App\Models\Product;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Render the report forms and details.
     */
    public function index(): Response
    {
        $salesSum = Order::sum('grand_total');
        $expenseSum = Expense::sum('amount');
        
        return Inertia::render('Reports/Index', [
            'stats' => [
                'total_sales' => round($salesSum, 2),
                'total_expenses' => round($expenseSum, 2),
                'net_income' => round($salesSum - $expenseSum, 2)
            ]
        ]);
    }

    /**
     * Stream a CSV report file.
     */
    public function export(Request $request)
    {
        $request->validate([
            'type' => ['required', 'in:sales,expenses,inventory'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date']
        ]);

        $type = $request->input('type');
        $startDate = $request->input('start_date', date('Y-m-d', strtotime('-30 days')));
        $endDate = $request->input('end_date', date('Y-m-d'));

        $filename = "pos_report_{$type}_" . date('Ymd_His') . ".csv";

        return new StreamedResponse(function () use ($type, $startDate, $endDate) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            if ($type === 'sales') {
                fputcsv($handle, ['Invoice Number', 'Date', 'Subtotal', 'Tax', 'Discount', 'Grand Total', 'Payment Method']);
                
                Order::whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->chunk(100, function ($orders) use ($handle) {
                        foreach ($orders as $order) {
                            fputcsv($handle, [
                                $order->invoice_number,
                                $order->created_at->format('Y-m-d H:i:s'),
                                $order->subtotal,
                                $order->tax,
                                $order->discount,
                                $order->grand_total,
                                ucfirst($order->payment_method)
                            ]);
                        }
                    });
            } elseif ($type === 'expenses') {
                fputcsv($handle, ['ID', 'Date', 'Category', 'Description', 'Amount']);

                Expense::whereBetween('date', [$startDate, $endDate])
                    ->chunk(100, function ($expenses) use ($handle) {
                        foreach ($expenses as $exp) {
                            fputcsv($handle, [
                                $exp->id,
                                $exp->date,
                                $exp->category,
                                $exp->description,
                                $exp->amount
                            ]);
                        }
                    });
            } elseif ($type === 'inventory') {
                fputcsv($handle, ['SKU/Barcode', 'Product Name', 'Category', 'Cost Price', 'Retail Price', 'Stock Level', 'Asset Value']);

                Product::with('category')->chunk(100, function ($products) use ($handle) {
                    foreach ($products as $prod) {
                        fputcsv($handle, [
                            $prod->sku,
                            $prod->name,
                            $prod->category ? $prod->category->name : 'Uncategorized',
                            $prod->cost_price,
                            $prod->retail_price,
                            $prod->stock_quantity,
                            round($prod->stock_quantity * $prod->cost_price, 2)
                        ]);
                    }
                });
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}
