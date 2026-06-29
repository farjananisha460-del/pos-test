import React, { useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    // Pre-fill fields for demo speed testing
    const fillDemo = (role) => {
        if (role === 'admin') {
            setData({
                email: 'admin@pos.local',
                password: 'password',
                remember: true
            });
        } else {
            setData({
                email: 'cashier@pos.local',
                password: 'password',
                remember: true
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
            <Head title="Cashier Login" />

            {/* Glowing background circles for modern aesthetics */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 space-y-6">
                
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100 uppercase tracking-wider">ANTIGRAVITY POS</h2>
                    <p className="text-slate-400 text-xs">Enter your authorization credentials to unlock register</p>
                </div>

                {status && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Mail className="w-4 h-4" />
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="name@company.com"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-950/60 text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium text-sm"
                            />
                        </div>
                        {errors.email && (
                            <span className="text-rose-400 text-xs flex items-center gap-1.5 pt-0.5">
                                <ShieldAlert className="w-3.5 h-3.5" /> {errors.email}
                            </span>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                            Security Password
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-950/60 text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium text-sm"
                            />
                        </div>
                        {errors.password && (
                            <span className="text-rose-400 text-xs flex items-center gap-1.5 pt-0.5">
                                <ShieldAlert className="w-3.5 h-3.5" /> {errors.password}
                            </span>
                        )}
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-slate-800 bg-slate-950 text-brand-500 focus:ring-brand-500/20 focus:ring-offset-0 focus:ring-2 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-xs text-slate-400 font-medium">Keep register active for this shift</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Authorize Login'
                        )}
                    </button>
                </form>

                {/* Demo Helper Panel */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block text-center">
                        Quick Demo Logins
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <button
                            onClick={() => fillDemo('cashier')}
                            className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 text-slate-300 transition-colors flex flex-col items-center gap-0.5"
                        >
                            <span className="font-bold text-brand-400">Cashier Login</span>
                            <span className="text-[10px] text-slate-500">cashier@pos.local</span>
                        </button>
                        <button
                            onClick={() => fillDemo('admin')}
                            className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 text-slate-300 transition-colors flex flex-col items-center gap-0.5"
                        >
                            <span className="font-bold text-brand-400">Admin Login</span>
                            <span className="text-[10px] text-slate-500">admin@pos.local</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
