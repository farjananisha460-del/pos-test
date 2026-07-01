import React, { useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    TrendingUp, 
    ShoppingCart, 
    Users, 
    Package, 
    DollarSign, 
    LineChart as ChartIcon,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    TrendingDown,
    Activity
} from 'lucide-react';

export default function Dashboard({ metrics, charts, recent_sales, low_stock_products }) {
    const dailyChartRef = useRef(null);
    const productChartRef = useRef(null);
    const paymentChartRef = useRef(null);

    // Initializing Chart.js instances via window.Chart
    useEffect(() => {
        const Chart = window.Chart;
        if (!Chart) return;

        // 1. Daily Sales Line Chart
        const dailyCtx = dailyChartRef.current.getContext('2d');
        const dailyChart = new Chart(dailyCtx, {
            type: 'line',
            data: {
                labels: charts.daily_sales.map(d => d.label),
                datasets: [{
                    label: 'Sales Revenue ($)',
                    data: charts.daily_sales.map(d => d.value),
                    borderColor: '#2563EB',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2563EB',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { grid: { color: 'rgba(100, 116, 139, 0.1)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // 2. Top Products Bar Chart
        const productCtx = productChartRef.current.getContext('2d');
        const productChart = new Chart(productCtx, {
            type: 'bar',
            data: {
                labels: charts.top_products.map(p => p.name),
                datasets: [{
                    label: 'Units Sold',
                    data: charts.top_products.map(p => p.quantity),
                    backgroundColor: [
                        '#2563EB',
                        '#0EA5E9',
                        '#22C55E',
                        '#F59E0B',
                        '#6366F1'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { grid: { color: 'rgba(100, 116, 139, 0.1)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // 3. Payment Methods Doughnut Chart
        const paymentCtx = paymentChartRef.current.getContext('2d');
        const paymentChart = new Chart(paymentCtx, {
            type: 'doughnut',
            data: {
                labels: charts.payment_distribution.map(p => p.method),
                datasets: [{
                    data: charts.payment_distribution.map(p => p.total),
                    backgroundColor: [
                        '#10B981',
                        '#3B82F6',
                        '#EC4899',
                        '#F97316',
                        '#8B5CF6',
                        '#6366F1',
                        '#F59E0B'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            font: { size: 10 }
                        }
                    }
                }
            }
        });

        return () => {
            dailyChart.destroy();
            productChart.destroy();
            paymentChart.destroy();
        };
    }, [charts]);

    return (
        <AuthenticatedLayout>
            <Head title="Analytics Dashboard" />

            <div className="space-y-6">
                
                {/* Header widget */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-wider">Antigravity POS Dashboard</h1>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Real-time enterprise metrics & catalog diagnostics.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link 
                            href="/pos" 
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10"
                        >
                            Open Cash Register
                        </Link>
                    </div>
                </div>

                {/* 8 Stats Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Today's Sales */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Today's Sales</span>
                            <span className="text-lg font-black block">${metrics.today_sales}</span>
                            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">
                                <ArrowUpRight className="w-3 h-3" /> +12% vs yesterday
                            </span>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Today's Orders */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Today's Orders</span>
                            <span className="text-lg font-black block">{metrics.today_orders} sales</span>
                            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">
                                <ArrowUpRight className="w-3 h-3" /> +8% vs yesterday
                            </span>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Active Customers */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Total Customers</span>
                            <span className="text-lg font-black block">{metrics.total_customers} users</span>
                            <span className="text-[9px] text-blue-500 font-bold">Loyalty CRM Active</span>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Total Products */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Catalog Items</span>
                            <span className="text-lg font-black block">{metrics.total_products} SKUs</span>
                            <span className="text-[9px] text-orange-500 font-semibold">{metrics.low_stock_count} item low stock</span>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Total Revenue</span>
                            <span className="text-lg font-black block">${metrics.total_revenue}</span>
                            <span className="text-[9px] text-slate-400 font-bold">Gross transaction value</span>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Total Profit */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Net Profit</span>
                            <span className="text-lg font-black block">${metrics.total_profit}</span>
                            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">
                                <ArrowUpRight className="w-3 h-3" /> margin: {metrics.total_revenue > 0 ? round((metrics.total_profit/metrics.total_revenue)*100, 1) : 0}%
                            </span>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Total Expenses</span>
                            <span className="text-lg font-black block">${metrics.total_expenses}</span>
                            <span className="text-[9px] text-red-500 font-bold flex items-center gap-0.5">
                                Utilities / Salary outgoings
                            </span>
                        </div>
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Stock Shortage</span>
                            <span className="text-lg font-black block text-red-500">{metrics.out_of_stock_count} sold out</span>
                            <span className="text-[9px] text-amber-500 font-bold flex items-center gap-0.5 animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5" /> Action required
                            </span>
                        </div>
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>

                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Line Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-500" />
                                Sales Trend (Last 7 Days)
                            </h3>
                        </div>
                        <div className="h-64 relative">
                            <canvas ref={dailyChartRef}></canvas>
                        </div>
                    </div>

                    {/* Payment methods Doughnut */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2">
                                <ChartIcon className="w-4 h-4 text-blue-500" />
                                Payment Breakdown
                            </h3>
                        </div>
                        <div className="h-64 relative">
                            <canvas ref={paymentChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Catalog alerts & Activity Logs lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Recent Orders log */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-extrabold text-xs tracking-wider uppercase">Recent Invoiced Orders</h3>
                        </div>
                        <div className="space-y-3.5">
                            {recent_sales.map((sale) => (
                                <div key={sale.id} className="flex justify-between items-center text-xs">
                                    <div className="text-left space-y-0.5">
                                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{sale.invoice_number}</span>
                                        <span className="text-[10px] text-slate-400 block font-semibold">
                                            {sale.customer_name} • {sale.time_ago}
                                        </span>
                                    </div>
                                    <div className="text-right space-y-0.5">
                                        <span className="font-mono font-bold text-blue-550 block">${sale.grand_total}</span>
                                        <span className="text-[9px] uppercase font-black text-slate-400 block bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded">
                                            {sale.payment_method}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Low Stock alarms list */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-extrabold text-xs tracking-wider uppercase text-red-500">Stock Inventory Warning Alerts</h3>
                        </div>
                        <div className="space-y-3.5">
                            {low_stock_products.length === 0 ? (
                                <p className="text-xs text-slate-400 font-semibold text-center py-4">All catalog items are well stocked! 👍</p>
                            ) : (
                                low_stock_products.map((prod) => (
                                    <div key={prod.id} className="flex justify-between items-center text-xs">
                                        <div className="text-left space-y-0.5">
                                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{prod.name}</span>
                                            <span className="text-[10px] text-slate-400 block font-semibold">{prod.category?.name}</span>
                                        </div>
                                        <span className="font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded font-mono">
                                            Qty Left: {prod.stock_quantity}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}

// Math rounding helper
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
