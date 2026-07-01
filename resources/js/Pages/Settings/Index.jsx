import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Settings as SettingsIcon,
    Database,
    Keyboard,
    Globe,
    CheckCircle,
    RotateCcw
} from 'lucide-react';

export default function Settings() {
    const [currency, setCurrency] = useState('USD ($)');
    const [language, setLanguage] = useState('English (US)');
    const [backupSuccess, setBackupSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const triggerBackup = () => {
        setIsSaving(true);
        setBackupSuccess(false);

        // Mock database backup log delay
        setTimeout(() => {
            setIsSaving(false);
            setBackupSuccess(true);
        }, 1500);
    };

    const shortcuts = [
        { keys: 'ESC', action: 'Close active modals / cancel checkout' },
        { keys: 'F12', action: 'Direct cash payment confirmation (Pay & Invoice)' },
        { keys: 'Ctrl + /', action: 'Focus search input bar immediately' },
        { keys: 'Ctrl + B', action: 'Scan mode shortcut toggle' },
        { keys: 'Alt + C', action: 'Clear active cart completely' }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="System Settings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-wider">System Settings</h1>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Configure cashier terminals, keyboard shortcuts, and perform database logs.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                    {/* General Settings */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4">
                        <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                            <Globe className="w-4 h-4 text-blue-500" />
                            Localization Settings
                        </h3>

                        <div className="space-y-4 pt-1">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Store Currency Symbol</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none"
                                >
                                    <option value="USD ($)">USD ($)</option>
                                    <option value="BDT (৳)">BDT (৳)</option>
                                    <option value="EUR (€)">EUR (€)</option>
                                    <option value="GBP (£)">GBP (£)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Register Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none"
                                >
                                    <option value="English (US)">English (US)</option>
                                    <option value="Bangla (BD)">Bangla (BD)</option>
                                    <option value="Español (ES)">Español (ES)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Backups manager */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4">
                        <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                            <Database className="w-4 h-4 text-blue-500" />
                            Database Backup Diagnostics
                        </h3>

                        <div className="space-y-4 pt-1">
                            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                                Perform manual database dumps of products, categories, orders, and customer databases. SQLite binary backups are compiled instantly.
                            </p>

                            <button
                                onClick={triggerBackup}
                                disabled={isSaving}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-750 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
                            >
                                <Database className="w-4 h-4" />
                                {isSaving ? 'Compiling Backup...' : 'Compile Manual Backup'}
                            </button>

                            {backupSuccess && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-500 flex items-center gap-2 font-semibold">
                                    <CheckCircle className="w-4.5 h-4.5" /> Database binary backup completed successfully. (File: backup_sql.sqlite)
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Keyboard Shortcuts list */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm space-y-4">
                        <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                            <Keyboard className="w-4 h-4 text-blue-500" />
                            Cashier Keyboard Shortcuts
                        </h3>

                        <div className="space-y-3.5 pt-1">
                            {shortcuts.map((sc, i) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                    <span className="text-slate-650 dark:text-slate-400 font-semibold">{sc.action}</span>
                                    <span className="font-mono bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-250 dark:border-slate-800 text-slate-650 dark:text-slate-200 font-black">
                                        {sc.keys}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
