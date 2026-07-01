import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Receipt, 
    Search, 
    Printer, 
    Eye,
    Landmark,
    Calendar,
    ChevronRight,
    User,
    DollarSign,
    X
} from 'lucide-react';
import ReceiptPrint from '@/Components/ReceiptPrint';

export default function Sales({ sales, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || '');
    
    // Selected order for detailed modal lookup
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        router.get('/sales', { search: e.target.value, payment_method: paymentMethod }, { preserveState: true, replace: true });
    };

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
        router.get('/sales', { search: search, payment_method: e.target.value }, { preserveState: true, replace: true });
    };

    const triggerPrint = (order) => {
        // Set selected order, wait for state update, and print
        setSelectedOrder(order);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Sales Invoice History" />

            {/* Print Receipt Template Container (visible only when printing) */}
            {selectedOrder && <ReceiptPrint order={selectedOrder} />}

            <div className="space-y-6 no-print">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-wider">Sales Log</h1>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Audit transaction invoices, reprint receipts, and track cashier registers.</p>
                    </div>
                </div>

                {/* Filters block */}
                <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Filter by invoice number, customer representatives..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 placeholder-slate-500 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold transition-all"
                        />
                    </div>
                    
                    {/* Payment channels filter dropdown */}
                    <div className="w-full sm:w-48 shrink-0">
                        <select
                            value={paymentMethod}
                            onChange={handlePaymentChange}
                            className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none"
                        >
                            <option value="">All Payment Types</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                            <option value="rocket">Rocket</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="gift_card">Gift Card</option>
                        </select>
                    </div>
                </div>

                {/* Sales logs listing table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="overflow-x-auto select-none">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                    <th className="py-2.5">Invoice #</th>
                                    <th>Date</th>
                                    <th>Cashier</th>
                                    <th>Customer</th>
                                    <th>Payment Method</th>
                                    <th>Grand Total</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                {sales.map(sale => (
                                    <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                                        <td className="py-3 font-extrabold text-blue-500">{sale.invoice_number}</td>
                                        <td className="font-mono text-slate-400">{new Date(sale.created_at).toLocaleString()}</td>
                                        <td className="font-semibold text-slate-600 dark:text-slate-300">{sale.cashier?.name}</td>
                                        <td className="font-semibold text-slate-600 dark:text-slate-350">{sale.customer?.name || 'Walk-in Customer'}</td>
                                        <td>
                                            <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td className="font-bold font-mono text-slate-800 dark:text-slate-100">${sale.grand_total}</td>
                                        <td className="text-right flex items-center justify-end gap-2 pt-2">
                                            <button
                                                onClick={() => setSelectedOrder(sale)}
                                                className="p-1.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
                                                title="View Receipt Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => triggerPrint(sale)}
                                                className="p-1.5 rounded-xl border border-blue-500/10 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 transition-all"
                                                title="Print Invoice Receipt"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* DETAILED RECEIPT DIALOG MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm no-print">
                    <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 text-black text-left">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-150">
                            <span className="font-extrabold text-xs text-gray-500 uppercase flex items-center gap-1.5">
                                <Receipt className="w-4 h-4 text-blue-500" />
                                Receipt Invoice details
                            </span>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-black font-semibold text-xs"
                            >
                                CLOSE
                            </button>
                        </div>

                        {/* Order Details Body */}
                        <div className="my-4 space-y-4 flex-1 overflow-y-auto">
                            <div className="text-center space-y-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">INVOICE SLIP</span>
                                <h3 className="font-extrabold text-md">{selectedOrder.invoice_number}</h3>
                                <p className="text-[10px] text-gray-500">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                            </div>

                            {/* Meta info lists */}
                            <div className="grid grid-cols-2 gap-2 text-xs border-y py-3 border-gray-100">
                                <div>
                                    <span className="text-[9px] font-bold text-gray-400 block uppercase">Cashier Staff</span>
                                    <span className="font-semibold text-gray-800">{selectedOrder.cashier?.name}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-gray-400 block uppercase">Customer Account</span>
                                    <span className="font-semibold text-gray-800">{selectedOrder.customer?.name || 'Walk-in'}</span>
                                </div>
                            </div>

                            {/* Invoice items mapping */}
                            <div className="space-y-2.5">
                                {selectedOrder.items?.map((item) => (
                                    <div key={item.id} className="flex justify-between text-xs font-semibold">
                                        <div>
                                            <span>{item.product?.name}</span>
                                            <span className="text-[10px] text-gray-400 block font-mono">{item.quantity} x ${parseFloat(item.historical_unit_price).toFixed(2)}</span>
                                        </div>
                                        <span className="font-mono text-gray-700">${(parseFloat(item.historical_unit_price) * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Subtotals summaries */}
                            <div className="border-t pt-3 space-y-2 text-xs font-semibold">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="font-mono">${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Tax (10%)</span>
                                    <span className="font-mono">${parseFloat(selectedOrder.tax).toFixed(2)}</span>
                                </div>
                                {parseFloat(selectedOrder.discount) > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Discount</span>
                                        <span className="font-mono">-${parseFloat(selectedOrder.discount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-2 text-sm font-black text-gray-900">
                                    <span>Grand Total</span>
                                    <span className="font-mono text-md text-blue-600">${parseFloat(selectedOrder.grand_total).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl text-[10px] font-bold text-center text-gray-500">
                                Payment Method: {selectedOrder.payment_method.toUpperCase()}
                            </div>
                        </div>

                        <button
                            onClick={() => triggerPrint(selectedOrder)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                            <Printer className="w-4 h-4" /> Print Thermal Copy
                        </button>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
