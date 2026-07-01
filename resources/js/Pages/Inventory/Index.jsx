import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    AlertTriangle, 
    FolderKanban, 
    Printer, 
    RefreshCw, 
    Search,
    BookOpen,
    FileSpreadsheet,
    Plus,
    History,
    CheckCircle
} from 'lucide-react';

export default function Inventory({ lowStock, history }) {
    const [activeTab, setActiveTab] = useState('alerts');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState('50');
    const [remarks, setRemarks] = useState('Stock arrival shipment');
    
    // Barcode viewer overlay state
    const [barcodeItem, setBarcodeItem] = useState(null);

    const handleAdjust = (e) => {
        e.preventDefault();
        if (!selectedProduct) return;

        router.post('/inventory/adjust', {
            product_id: selectedProduct.id,
            quantity: parseInt(quantity) || 0,
            type: 'restock',
            remarks: remarks
        }, {
            onSuccess: () => {
                setSelectedProduct(null);
                setRemarks('Stock arrival shipment');
                setQuantity('50');
            }
        });
    };

    const triggerPrintLabel = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inventory Audit & Barcodes" />

            {/* Print Barcode Label Template Container (visible only when printing) */}
            {barcodeItem && (
                <div className="only-print bg-white text-black p-8 text-center space-y-4 max-w-sm mx-auto border-2 border-black rounded-lg">
                    <span className="font-extrabold text-sm uppercase tracking-wider block">ANTIGRAVITY RETAIL LABEL</span>
                    <h3 className="font-extrabold text-lg mt-1">{barcodeItem.name}</h3>
                    <div className="flex justify-center my-3">
                        <img 
                            src={`https://barcode.tec-it.com/barcode.ashx?data=${barcodeItem.sku}&code=Code128&translate-esc=on`} 
                            alt={barcodeItem.sku}
                            className="h-16"
                        />
                    </div>
                    <span className="font-mono font-bold block tracking-widest text-sm mt-1">{barcodeItem.sku}</span>
                    <span className="font-black text-xl font-mono block mt-2">${parseFloat(barcodeItem.retail_price).toFixed(2)}</span>
                    <span className="text-[10px] text-gray-500 block border-t pt-2 mt-2">Print Date: {new Date().toLocaleDateString()}</span>
                </div>
            )}

            <div className="space-y-6 no-print">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-wider">Inventory & Barcodes</h1>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Audit catalog levels, restock alerts, and print-ready label configurations.</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                            activeTab === 'alerts' 
                                ? 'border-blue-600 text-blue-500' 
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Low Stock Alerts ({lowStock.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                            activeTab === 'history' 
                                ? 'border-blue-600 text-blue-500' 
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Stock History Audit
                    </button>
                </div>

                {activeTab === 'alerts' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Low Stock Listing */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
                                <h3 className="font-extrabold text-xs tracking-wider uppercase text-red-500">Critical Stock Warning Levels</h3>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                    {lowStock.length === 0 ? (
                                        <p className="text-xs text-slate-400 font-semibold py-8 text-center">No inventory alerts are active.</p>
                                    ) : (
                                        lowStock.map(prod => (
                                            <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                                                <div className="text-left">
                                                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block leading-tight">{prod.name}</span>
                                                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">SKU: {prod.sku} • Cat: {prod.category?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded font-mono text-xs">
                                                        Qty: {prod.stock_quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => setSelectedProduct(prod)}
                                                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 font-extrabold text-[10px] rounded-xl transition-all"
                                                    >
                                                        RESTOCK
                                                    </button>
                                                    <button
                                                        onClick={() => setBarcodeItem(prod)}
                                                        className="p-1.5 rounded-xl border border-slate-250 dark:border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                                        title="Print barcode label"
                                                    >
                                                        <Printer className="w-4.5 h-4.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Restocking widget */}
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4 text-left">
                                <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2">
                                    <FolderKanban className="w-4 h-4 text-blue-500" />
                                    Quick Restocking
                                </h3>

                                {selectedProduct ? (
                                    <form onSubmit={handleAdjust} className="space-y-4">
                                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Selected SKU</span>
                                            <p className="font-extrabold text-slate-800 dark:text-slate-100">{selectedProduct.name}</p>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Restock Quantity</label>
                                            <input
                                                type="number"
                                                required
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Audit Remarks</label>
                                            <input
                                                type="text"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                                            >
                                                Submit Order
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedProduct(null)}
                                                className="px-3 py-2 bg-slate-200 dark:bg-slate-850 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-500 rounded-xl font-bold text-xs"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400">
                                        <History className="w-8 h-8 text-slate-500 mb-2" />
                                        <p className="text-[11px] font-semibold">Select a product from the alert list to perform quick restock injections.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                ) : (
                    /* Stock audit history logs */
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4">
                        <h3 className="font-extrabold text-xs tracking-wider uppercase text-left">Historical Audit Logs</h3>
                        <div className="overflow-x-auto select-none">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="py-2.5">Date</th>
                                        <th>Product Name</th>
                                        <th>Movement</th>
                                        <th>Operation Type</th>
                                        <th>Invoicing Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                    {history.map(h => (
                                        <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                                            <td className="py-3 font-mono text-[10px] text-slate-400">
                                                {new Date(h.created_at).toLocaleString()}
                                            </td>
                                            <td className="font-extrabold text-slate-850 dark:text-slate-100">{h.product?.name}</td>
                                            <td className={`font-bold font-mono ${h.change_quantity >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {h.change_quantity >= 0 ? `+${h.change_quantity}` : h.change_quantity}
                                            </td>
                                            <td>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                                    h.type === 'sale' ? 'bg-blue-500/10 text-blue-500' :
                                                    h.type === 'restock' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                    {h.type}
                                                </span>
                                            </td>
                                            <td className="text-slate-400 font-semibold">{h.remarks || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Printable Label Drawer View */}
            {barcodeItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm no-print">
                    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 text-black text-left">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-150">
                            <span className="font-extrabold text-xs text-gray-500 uppercase">Barcode Preview</span>
                            <button 
                                onClick={() => setBarcodeItem(null)}
                                className="text-gray-400 hover:text-black font-semibold text-xs"
                            >
                                CLOSE
                            </button>
                        </div>
                        <div className="my-6 text-center space-y-2">
                            <h3 className="font-extrabold text-md">{barcodeItem.name}</h3>
                            <div className="flex justify-center">
                                <img 
                                    src={`https://barcode.tec-it.com/barcode.ashx?data=${barcodeItem.sku}&code=Code128&translate-esc=on`} 
                                    alt={barcodeItem.sku}
                                    className="h-14"
                                />
                            </div>
                            <span className="font-mono text-xs tracking-wider block font-bold text-gray-700">{barcodeItem.sku}</span>
                            <span className="font-black text-lg block">${parseFloat(barcodeItem.retail_price).toFixed(2)}</span>
                        </div>
                        <button
                            onClick={triggerPrintLabel}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                            <Printer className="w-4 h-4" /> Print Label
                        </button>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
