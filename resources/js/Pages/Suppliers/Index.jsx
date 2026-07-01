import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Truck, 
    Trash2, 
    Edit3, 
    Search,
    Landmark,
    Phone,
    Mail,
    X,
    UserCheck
} from 'lucide-react';

export default function Suppliers({ suppliers, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editSupplier, setEditSupplier] = useState(null);

    // Form inputs state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [balanceDue, setBalanceDue] = useState('0.00');

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        router.get('/suppliers', { search: e.target.value }, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        setEditSupplier(null);
        setName('');
        setEmail('');
        setPhone('');
        setCompany('');
        setBalanceDue('0.00');
        setShowModal(true);
    };

    const openEditModal = (supp) => {
        setEditSupplier(supp);
        setName(supp.name);
        setEmail(supp.email || '');
        setPhone(supp.phone || '');
        setCompany(supp.company || '');
        setBalanceDue(supp.balance_due);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { name, email, phone, company, balance_due: parseFloat(balanceDue) || 0 };

        if (editSupplier) {
            router.put(`/suppliers/${editSupplier.id}`, payload, {
                onSuccess: () => {
                    setShowModal(false);
                }
            });
        } else {
            router.post('/suppliers', payload, {
                onSuccess: () => {
                    setShowModal(false);
                }
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this supplier profile?")) {
            router.delete(`/suppliers/${id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Suppliers Directory" />

            <div className="space-y-6">
                
                {/* Header widget */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-wider">Suppliers Directory</h1>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage supply chain logisticians, corporate profiles, and purchase bills.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                    >
                        <UserCheck className="w-4 h-4" /> Add New Supplier
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
                            placeholder="Filter by representative name, company corporate, phone..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 placeholder-slate-500 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold transition-all"
                        />
                    </div>
                </div>

                {/* Supplier cards list */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {suppliers.map((supp) => (
                        <div 
                            key={supp.id} 
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                        >
                            
                            <div className="space-y-3">
                                {/* Header */}
                                <div className="text-left">
                                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{supp.name}</h3>
                                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                        Company: <span className="text-blue-500">{supp.company || 'Private Vendor'}</span>
                                    </span>
                                </div>

                                {/* Contact Lists */}
                                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/40 pt-3 text-left">
                                    {supp.phone && (
                                        <p className="flex items-center gap-2 font-semibold">
                                            <Phone className="w-3.5 h-3.5 text-slate-500" /> {supp.phone}
                                        </p>
                                    )}
                                    {supp.email && (
                                        <p className="flex items-center gap-2 font-semibold truncate">
                                            <Mail className="w-3.5 h-3.5 text-slate-500" /> {supp.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Dues billing and Controls */}
                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-2">
                                <div className="text-left">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-bold">Outstanding Bill</span>
                                    <span className={`font-mono text-sm font-black ${parseFloat(supp.balance_due) > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                        ${supp.balance_due}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(supp)}
                                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
                                        title="Modify Profile"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(supp.id)}
                                        className="p-2.5 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all"
                                        title="Delete Supplier"
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
                                <Truck className="w-5 h-5 text-blue-500" />
                                {editSupplier ? 'Modify Supplier Details' : 'Register Supplier profile'}
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* Supplier Name */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Representative Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jane representative"
                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold"
                                />
                            </div>

                            {/* Company Corporate */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company / Corporate Entity</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="Unilever BD"
                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold"
                                />
                            </div>

                            {/* Contact Phone */}
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
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Corporate Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="supply@unilever.com"
                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold"
                                />
                            </div>

                            {/* Outstanding balance */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Outstanding Bill ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={balanceDue}
                                    onChange={(e) => setBalanceDue(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold font-mono"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                            >
                                {editSupplier ? 'Save Details' : 'Register Supplier'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
