import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    ShoppingCart, 
    Receipt, 
    Package, 
    FolderKanban, 
    Users, 
    Truck, 
    FileSpreadsheet, 
    BrainCircuit, 
    Settings, 
    LogOut, 
    Bell, 
    Sun, 
    Moon, 
    Search,
    Menu,
    X,
    Clock,
    UserCheck,
    Sparkles
} from 'lucide-react';

export default function AuthenticatedLayout({ children }) {
    const { url, props } = usePage();
    const auth = props.auth || { user: { name: 'Cashier Staff', role: 'cashier', email: 'cashier@pos.local' } };
    
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Live clock hook
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Dark Mode initializer
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light') {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            setIsDarkMode(false);
            localStorage.setItem('theme', 'light');
            document.documentElement.classList.remove('dark');
        } else {
            setIsDarkMode(true);
            localStorage.setItem('theme', 'dark');
            document.documentElement.classList.add('dark');
        }
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, route: 'dashboard', path: '/dashboard' },
        { name: 'POS Terminal', icon: ShoppingCart, route: 'pos', path: '/pos' },
        { name: 'Sales Log', icon: Receipt, route: 'sales.index', path: '/sales' },
        { name: 'Products Catalog', icon: Package, route: 'products.index', path: '/products' },
        { name: 'Inventory & Barcodes', icon: FolderKanban, route: 'inventory.index', path: '/inventory' },
        { name: 'Customers CRM', icon: Users, route: 'customers.index', path: '/customers' },
        { name: 'Suppliers Directory', icon: Truck, route: 'suppliers.index', path: '/suppliers' },
        { name: 'Reports Export', icon: FileSpreadsheet, route: 'reports.index', path: '/reports' },
        { name: 'AI Forecasts', icon: BrainCircuit, route: 'ai.index', path: '/ai' },
        { name: 'Settings', icon: Settings, route: 'settings.index', path: '/settings' },
    ];

    // Notification Mock Data / Feed
    const mockNotifications = [
        { id: 1, title: 'Low Stock Alert', desc: 'Anker Power Bank is below 10 units.', type: 'warning' },
        { id: 2, title: 'Daily Target Reached', desc: 'Congratulations! Today\'s sales exceeded $1,500.', type: 'success' },
        { id: 3, title: 'Database Backup', desc: 'Auto system backup completed successfully.', type: 'info' }
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-200 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            
            {/* Sidebar Left */}
            <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r ${
                sidebarOpen ? 'w-64' : 'w-20'
            } ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } flex flex-col justify-between overflow-hidden shadow-sm`}>
                
                {/* Logo section */}
                <div>
                    <div className={`h-16 flex items-center px-5 border-b gap-3 ${
                        isDarkMode ? 'border-slate-800' : 'border-slate-100'
                    }`}>
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        {sidebarOpen && (
                            <div className="flex flex-col">
                                <span className="font-extrabold text-sm uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                    Antigravity
                                </span>
                                <span className="text-[9px] font-bold text-slate-400">POS ENTERPRISE</span>
                            </div>
                        )}
                    </div>

                    {/* Nav Links */}
                    <nav className="p-4 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = url.startsWith(item.path);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className={`flex items-center gap-4 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                                        isActive 
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                            : isDarkMode 
                                                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' 
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                    title={!sidebarOpen ? item.name : ''}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    {sidebarOpen && <span>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer section */}
                <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-4 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-red-500 ${
                            isDarkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                        }`}
                        title={!sidebarOpen ? 'Logout' : ''}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main content wrapper */}
            <div className={`transition-all duration-300 min-h-screen flex flex-col ${sidebarOpen ? 'pl-64' : 'pl-20'}`}>
                
                {/* Navbar Header Top */}
                <header className={`h-16 flex items-center justify-between px-6 border-b shrink-0 ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md'
                } sticky top-0 z-30`}>
                    
                    {/* Left corner Header */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`p-2 rounded-lg hover:bg-slate-550 transition-colors ${
                                isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-150 text-slate-600'
                            }`}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Live Clock widget */}
                        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            isDarkMode ? 'bg-slate-850 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                            <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>

                        {/* Register Open Indicator */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            <span>Register Open</span>
                        </div>
                    </div>

                    {/* Right corner Header */}
                    <div className="flex items-center gap-4">
                        
                        {/* Dark/Light mode toggler */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-xl transition-all border ${
                                isDarkMode 
                                    ? 'bg-slate-850 border-slate-800 text-yellow-400 hover:bg-slate-800' 
                                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                            }`}
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                        </button>

                        {/* Notifications drop menu */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className={`p-2.5 rounded-xl transition-all relative border ${
                                    isDarkMode 
                                        ? 'bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800' 
                                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <Bell className="w-4.5 h-4.5" />
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                            </button>

                            {notificationsOpen && (
                                <div className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-xl p-4 border animate-in fade-in slide-in-from-top-2 duration-200 ${
                                    isDarkMode ? 'bg-slate-900 border-slate-850 text-slate-200' : 'bg-white border-slate-200 text-slate-850'
                                }`}>
                                    <div className="flex items-center justify-between pb-3 border-b mb-3 border-slate-800/40">
                                        <span className="font-extrabold text-xs tracking-wider uppercase">Notifications</span>
                                        <button 
                                            onClick={() => setNotificationsOpen(false)}
                                            className="text-xs text-blue-500 font-semibold hover:underline"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {mockNotifications.map(n => (
                                            <div key={n.id} className="text-left space-y-1">
                                                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                                    n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                                    n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                                                }`}>{n.title}</span>
                                                <p className="text-[11px] text-slate-400 font-semibold">{n.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Active user Profile widget */}
                        <div className="flex items-center gap-3 pl-3 border-l border-slate-800/40">
                            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 font-black text-xs flex items-center justify-center uppercase shadow-sm">
                                {auth.user?.name.slice(0,2)}
                            </div>
                            <div className="text-left hidden sm:block">
                                <span className="text-[11px] text-slate-400 font-bold block leading-none">Active Cashier</span>
                                <span className="text-xs font-extrabold block mt-0.5">{auth.user?.name}</span>
                            </div>
                        </div>

                    </div>
                </header>

                {/* Main Dynamic View Content */}
                <main className="flex-1 p-6 overflow-x-hidden">
                    {children}
                </main>
            </div>

        </div>
    );
}
