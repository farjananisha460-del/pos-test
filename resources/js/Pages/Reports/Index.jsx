import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    FileSpreadsheet, 
    Calendar, 
    ArrowDownToLine,
    TrendingUp,
    TrendingDown,
    DollarSign
} from 'lucide-react';

export default function Reports({ stats }) {
    const [startDate, setStartDate] = useState(dateDaysAgo(30));
    const [endDate, setEndDate] = useState(dateDaysAgo(0));

    const handleExport = (type) => {
        // Construct the streamed export URL
        const url = `/reports/export?type=${type}&start_date=${startDate}&end_date=${endDate}`;
        window.location.href = url;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reports Export Panel" />

            <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-wider">Reports Export</h1>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Generate, audit, and download formatted spreadsheet reports of cash registers.</p>
                    </div>
                </div>

                {/* Date range config */}
                <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-xs tracking-wider uppercase text-left flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        Configure Report Date Range Boundaries
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Start Date Boundary</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">End Date Boundary</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick stats summaries cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Historical Gross Sales</span>
                            <span className="text-lg font-black block">${stats.total_sales}</span>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Historical Expenses</span>
                            <span className="text-lg font-black block">${stats.total_expenses}</span>
                        </div>
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Historical Net Earnings</span>
                            <span className="text-lg font-black block">${stats.net_income}</span>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Export Categories widgets grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Sales Report card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between text-left">
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">Sales Invoices Report</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                                Exports customer orders, grand totals, discounts, cashier details, and payment channels breakdown.
                            </p>
                        </div>
                        <button
                            onClick={() => handleExport('sales')}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm mt-3"
                        >
                            <ArrowDownToLine className="w-4 h-4" /> Download Sales CSV
                        </button>
                    </div>

                    {/* Expense Report card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between text-left">
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">Store Expenses Report</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                                Exports billing category details, descriptions, transaction dates, and total amount logs.
                            </p>
                        </div>
                        <button
                            onClick={() => handleExport('expenses')}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm mt-3"
                        >
                            <ArrowDownToLine className="w-4 h-4" /> Download Expense CSV
                        </button>
                    </div>

                    {/* Inventory Audit card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between text-left">
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">Inventory Stock Audit</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                                Exports complete product catalogs, cost prices, retail values, quantities, and asset estimations.
                            </p>
                        </div>
                        <button
                            onClick={() => handleExport('inventory')}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm mt-3"
                        >
                            <ArrowDownToLine className="w-4 h-4" /> Download Stock CSV
                        </button>
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}

// Date helper
function dateDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
}
