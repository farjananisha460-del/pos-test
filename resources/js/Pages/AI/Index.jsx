import React, { useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    BrainCircuit, 
    TrendingUp, 
    AlertTriangle, 
    Sparkles,
    CheckCircle,
    LineChart as ChartIcon,
    Flame,
    TrendingDown,
    Zap
} from 'lucide-react';

export default function AI({ recommendations, forecast, insights }) {
    const forecastChartRef = useRef(null);

    useEffect(() => {
        const Chart = window.Chart;
        if (!Chart) return;

        // Draw next 7 days sales projections
        const ctx = forecastChartRef.current.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: forecast.map(f => f.date),
                datasets: [{
                    label: 'Projected Daily Sales ($)',
                    data: forecast.map(f => f.value),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10B981',
                    pointRadius: 5,
                    borderDash: [5, 5] // Dashed line to represent projection
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

        return () => chart.destroy();
    }, [forecast]);

    return (
        <AuthenticatedLayout>
            <Head title="AI Sales Projections" />

            <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
                            <BrainCircuit className="w-6 h-6 text-blue-500 animate-pulse" />
                            Antigravity AI Forecasts
                        </h1>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Automated linear-regression forecasting & smart restocking recommendations.</p>
                    </div>
                </div>

                {/* Projection Trend Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2">
                                <ChartIcon className="w-4 h-4 text-emerald-500" />
                                Sales Revenue Projection (Next 7 Days)
                            </h3>
                            <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">
                                AI Confidence: {insights.forecast_confidence}
                            </span>
                        </div>
                        <div className="h-64 relative">
                            <canvas ref={forecastChartRef}></canvas>
                        </div>
                    </div>

                    {/* AI Diagnostics details */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4 text-left">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2">
                                <Zap className="w-4 h-4 text-blue-500" />
                                Business Insights
                            </h3>
                        </div>
                        
                        <div className="space-y-4 pt-1">
                            {/* Monthly Growth */}
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-semibold">Monthly Growth Index</span>
                                <span className={`font-extrabold flex items-center gap-0.5 ${insights.monthly_growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {insights.monthly_growth >= 0 ? <TrendingUp className="w-4.5 h-4.5" /> : <TrendingDown className="w-4.5 h-4.5" />}
                                    {insights.monthly_growth}%
                                </span>
                            </div>

                            {/* Slope Trend direction */}
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-semibold">Projected Sales Direction</span>
                                <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${insights.trend === 'UPWARD' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {insights.trend}
                                </span>
                            </div>

                            {/* Avg ticket */}
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-semibold">Average Basket Ticket</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-150">${insights.average_ticket}</span>
                            </div>

                            {/* Popular hour */}
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-semibold">Peak Customer Traffic</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{insights.popular_hour}</span>
                            </div>
                        </div>

                        {/* Summary diagnostics advice */}
                        <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] leading-relaxed text-blue-500 font-medium">
                            <Sparkles className="w-4 h-4 mb-1" />
                            <strong>System Advisory:</strong> Past weeks indicate a strong {insights.trend.toLowerCase()} momentum. Keep popular items in stock and consider creating product bundles.
                        </div>
                    </div>
                </div>

                {/* Restocking Recommendations table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-extrabold text-xs tracking-wider uppercase text-left flex items-center gap-2">
                        <Flame className="w-4.5 h-4.5 text-orange-500" />
                        AI Smart Restocking Recommendations
                    </h3>

                    <div className="overflow-x-auto select-none">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                    <th className="py-2.5">SKU</th>
                                    <th>Product Name</th>
                                    <th>Stock Level</th>
                                    <th>Sales Velocity (30d)</th>
                                    <th>Recommended Restock</th>
                                    <th>Priority Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                {recommendations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-6 text-center text-slate-400 font-semibold">All products satisfy the 15-day sales safety buffers. No restock needed.</td>
                                    </tr>
                                ) : (
                                    recommendations.map(rec => (
                                        <tr key={rec.id} className="hover:bg-slate-550 dark:hover:bg-slate-950/40 transition-colors">
                                            <td className="py-3 font-mono font-bold text-slate-500">{rec.sku}</td>
                                            <td className="font-extrabold text-slate-850 dark:text-slate-100">{rec.name}</td>
                                            <td className="font-mono font-semibold">{rec.current_stock} units</td>
                                            <td className="font-mono font-semibold">{rec.velocity_30_days} sold / month</td>
                                            <td className="font-mono font-bold text-emerald-500">+{rec.recommended_restock} units</td>
                                            <td>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                                    rec.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/25' :
                                                    rec.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                    {rec.priority}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
