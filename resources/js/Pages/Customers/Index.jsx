import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Users, 
    UserPlus, 
    Trash2, 
    Edit3, 
    Search,
    Award,
    DollarSign,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';

export default function Customers({ customers, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editCustomer, setEditCustomer] = useState(null);

    // Form inputs state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [balanceDue, setBalanceDue] = useState('');
    const [rewardPoints, setRewardPoints] = useState('0');

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        router.get('/customers', { search: e.target.value }, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        setEditCustomer(null);
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setBalanceDue('0.00');
        setRewardPoints('0');
        setShowModal(true);
    };

    const openEditModal = (cust) => {
        setEditCustomer(cust);
        setName(cust.name);
        setEmail(cust.email || '');
        setPhone(cust.phone || '');
        setAddress(cust.address || '');
        setBalanceDue(cust.balance_due);
        setRewardPoints(cust.reward_points.toString());
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { name, email, phone, address, balance_due: parseFloat(balanceDue) || 0, reward_points: parseInt(rewardPoints) || 0 };

        if (editCustomer) {
            router.put(`/customers/${editCustomer.id}`, payload, {
                onSuccess: () => {
                    setShowModal(false);
                }
            });
        } else {
            router.post('/customers', payload, {
                onSuccess: () => {
                    setShowModal(false);
                }
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this customer's profile?")) {
            router.delete(`/customers/${id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Customers CRM" />

            <div className="space-y-6">
                
                {/* Header widget */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-wider">Customer Loyalty CRM</h1>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage customer rewards, tier profiles, and balance dues.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                    >
                        <UserPlus className="w-4 h-4" /> Add New Customer
                    </button>
                </div>

                {/* Search bar */}
                <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 shadow-sm flex items-center">
                    <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Filter by name, phone number, email..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 placeholder-slate-500 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold transition-all"
                        />
                    </div>
                </div>

                {/* Customer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {customers.map((cust) => (
                        <div 
                            key={cust.id} 
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                        >
                            
                            <div className="space-y-3">
                                {/* Header (Name & Membership) */}
                                <div className="flex justify-between items-start">
                                    <div className="text-left">
                                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{cust.name}</h3>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                                            cust.membership_level === 'Platinum' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                                            cust.membership_level === 'Gold' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' :
                                            cust.membership_level === 'Silver' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                            'bg-slate-100 dark:bg-slate-850 text-slate-400 border border-slate-200 dark:border-slate-800'
                                        }`}>
                                            {cust.membership_level} Member
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                                        <Award className="w-4 h-4 text-yellow-500" />
                                        <span className="font-mono font-bold text-xs">{cust.reward_points} pts</span>
                                    </div>
                                </div>

                                {/* Contact info lists */}
                                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/40 pt-3 text-left">
                                    {cust.phone && (
                                        <p className="flex items-center gap-2 font-semibold">
                                            <Phone className="w-3.5 h-3.5 text-slate-500" /> {cust.phone}
                                        </p>
                                    )}
                                    {cust.email && (
                                        <p className="flex items-center gap-2 font-semibold truncate">
                                            <Mail className="w-3.5 h-3.5 text-slate-500" /> {cust.email}
                                        </p>
                                    )}
                                    {cust.address && (
                                        <p className="flex items-center gap-2 font-semibold">
                                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {cust.address}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Dues and CRUD controls */}
                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-2">
                                <div className="text-left">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Due Balances</span>
                                    <span className={`font-mono text-sm font-black ${parseFloat(cust.balance_due) > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                        ${cust.balance_due}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(cust)}
                                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
                                        title="Edit Profile"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cust.id)}
                                        className="p-2.5 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all"
                                        title="Delete Profile"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

            </div>

            {/* CREATE / EDIT MODAL DOCK */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                {editCustomer ? 'Modify Customer Profile' : 'Register Customer Profile'}
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* Customer Name */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold"
                                />
                            </div>

                            {/* Phone number */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact Phone</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+880 1xxx-xxxxxx"
                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="johndoe@example.com"
                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Postal Address</label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Street block, City, Country"
                                    rows="2"
                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold"
                                ></textarea>
                            </div>

                            {/* Dues & Points */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Balance Due ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={balanceDue}
                                        onChange={(e) => setBalanceDue(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reward Points</label>
                                    <input
                                        type="number"
                                        value={rewardPoints}
                                        onChange={(e) => setRewardPoints(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold font-mono"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                            >
                                {editCustomer ? 'Save Details' : 'Register Customer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
