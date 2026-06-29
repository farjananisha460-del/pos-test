import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Search, 
    Trash2, 
    Plus, 
    Minus, 
    LogOut, 
    Sparkles, 
    Pause, 
    FolderSync, 
    CreditCard, 
    ChevronRight,
    AlertTriangle,
    RotateCcw
} from 'lucide-react';
import useBarcodeScanner from '@/Hooks/useBarcodeScanner';
import CheckoutModal from '@/Components/CheckoutModal';
import ReceiptPrint from '@/Components/ReceiptPrint';

export default function Dashboard({ categories, products, auth }) {
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [discountInput, setDiscountInput] = useState('');
    const [toast, setToast] = useState(null);
    
    // Suspended carts state
    const [suspendedCarts, setSuspendedCarts] = useState([]);
    const [showSuspendedDrawer, setShowSuspendedDrawer] = useState(false);

    // Modal state
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);

    // Toast notification manager
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Load suspended carts from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('suspended_carts');
        if (stored) {
            try {
                setSuspendedCarts(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse suspended carts", e);
            }
        }
    }, []);

    // Save suspended carts to localStorage when changed
    const saveSuspendedCarts = (newCarts) => {
        setSuspendedCarts(newCarts);
        localStorage.setItem('suspended_carts', JSON.stringify(newCarts));
    };

    // Add product to cart
    const addToCart = (product) => {
        if (product.stock_quantity <= 0) {
            showToast(`Product "${product.name}" is out of stock.`, 'error');
            return;
        }

        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock_quantity) {
                    showToast(`Cannot add more. Stock limit of ${product.stock_quantity} reached.`, 'error');
                    return prevCart;
                }
                showToast(`Increased quantity of ${product.name}`);
                return prevCart.map(item => 
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            showToast(`Added ${product.name} to cart`);
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    // Keyboard/Barcode listener integration
    useBarcodeScanner((barcode) => {
        const product = products.find(p => p.sku === barcode);
        if (product) {
            addToCart(product);
        } else {
            showToast(`Barcode "${barcode}" not found.`, 'error');
        }
    });

    // Update quantity manually
    const updateQuantity = (id, delta) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.id === id) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return item; // Handled by remove or keeps 1
                    
                    if (newQty > item.stock_quantity) {
                        showToast(`Only ${item.stock_quantity} units available in stock.`, 'error');
                        return { ...item, quantity: item.stock_quantity };
                    }
                    return { ...item, quantity: newQty };
                }
                return item;
            });
        });
    };

    // Remove item from cart
    const removeFromCart = (id) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
        showToast('Item removed from cart.');
    };

    // Clear cart completely
    const clearCart = () => {
        setCart([]);
        setDiscountInput('');
        showToast('Cart cleared.');
    };

    // Calculations
    const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.retail_price) * item.quantity), 0);
    const taxRate = 0.10; // 10% default tax
    const tax = cartTotal * taxRate;
    const discount = parseFloat(discountInput) || 0;
    const grandTotal = Math.max(0, cartTotal + tax - discount);

    // Suspend Cart
    const handleSuspendCart = () => {
        if (cart.length === 0) {
            showToast('Cannot suspend an empty cart.', 'error');
            return;
        }

        const newSuspendedCart = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            items: cart,
            discount: discountInput,
            total: grandTotal
        };

        const updated = [newSuspendedCart, ...suspendedCarts];
        saveSuspendedCarts(updated);
        setCart([]);
        setDiscountInput('');
        showToast('Cart suspended successfully.');
    };

    // Restore Cart
    const handleRestoreCart = (suspended) => {
        // Warn if current cart is not empty
        if (cart.length > 0) {
            const confirmReplace = window.confirm("You have items in your cart. Restoring will merge them. Continue?");
            if (!confirmReplace) return;
        }

        // Merge logic
        setCart(prev => {
            const merged = [...prev];
            suspended.items.forEach(item => {
                const existing = merged.find(m => m.id === item.id);
                if (existing) {
                    const combinedQty = existing.quantity + item.quantity;
                    // Cap combined quantity to product stock
                    existing.quantity = Math.min(combinedQty, item.stock_quantity);
                } else {
                    merged.push(item);
                }
            });
            return merged;
        });

        if (suspended.discount) {
            setDiscountInput(suspended.discount);
        }

        // Remove from suspended list
        const updated = suspendedCarts.filter(c => c.id !== suspended.id);
        saveSuspendedCarts(updated);
        setShowSuspendedDrawer(false);
        showToast('Suspended cart restored.');
    };

    // Delete Suspended Cart
    const handleDeleteSuspended = (id) => {
        const updated = suspendedCarts.filter(c => c.id !== id);
        saveSuspendedCarts(updated);
        showToast('Suspended cart deleted.');
    };

    // Successful backend transaction callback
    const handleOrderSuccess = (order) => {
        setCart([]);
        setDiscountInput('');
        if (order) {
            setLastOrder(order);
        }
    };

    // Cashier Logout
    const handleLogout = () => {
        router.post('/logout');
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.category_id.toString() === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.sku.includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none pb-4">
            <Head title="Checkout Terminal" />

            {/* Hidden component for printing receipt */}
            {lastOrder && <ReceiptPrint order={lastOrder} />}

            {/* Header bar */}
            <header className="no-print bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">ANTIGRAVITY POS</h1>
                        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full inline-block">
                            Register Open
                        </span>
                    </div>
                </div>

                {/* Cashier metadata */}
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <span className="text-slate-400 text-xs block">Active Staff</span>
                        <span className="font-semibold text-sm text-slate-200">
                            {auth.user?.name} 
                            <span className="ml-1.5 text-[10px] bg-brand-500/10 text-brand-300 border border-brand-500/20 font-bold px-1.5 py-0.5 rounded uppercase">
                                {auth.user?.role}
                            </span>
                        </span>
                    </div>
                    
                    {/* Suspended Carts Trigger */}
                    <button
                        onClick={() => setShowSuspendedDrawer(true)}
                        className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-300 border border-slate-700/50"
                        title="Resume Suspended Carts"
                    >
                        <FolderSync className="w-5 h-5" />
                        {suspendedCarts.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-extrabold text-[9px] rounded-full w-5 h-5 flex items-center justify-center animate-pulse border-2 border-slate-900">
                                {suspendedCarts.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-2 text-xs font-bold"
                    >
                        <LogOut className="w-4 h-4" /> <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Terminal View */}
            <main className="no-print flex-1 flex flex-col md:flex-row overflow-hidden px-4 gap-4 mt-4">
                
                {/* LEFT SIDE: SEARCH & PRODUCT GRID */}
                <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                    {/* Search & Category Header */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                        {/* Search Input */}
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                <Search className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name, SKU barcode or scan with reader..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-950 text-slate-200 placeholder-slate-500 rounded-xl border border-slate-850 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 font-semibold"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Horizontal Categories Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none scrollbar-thin">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                                    selectedCategory === 'all'
                                        ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-800'
                                }`}
                            >
                                All Categories
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id.toString())}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                                        selectedCategory === cat.id.toString()
                                            ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-800'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid Container */}
                    <div className="flex-1 overflow-y-auto pr-1">
                        {filteredProducts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 p-8 text-center">
                                <AlertTriangle className="w-12 h-12 text-slate-600 mb-2" />
                                <h3 className="font-bold text-slate-300">No Products Found</h3>
                                <p className="text-xs text-slate-500 max-w-xs mt-1">
                                    No items match the search query "{searchQuery}" or category filter. Check active records.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                                {filteredProducts.map((prod) => {
                                    const isLowStock = prod.stock_quantity > 0 && prod.stock_quantity < 10;
                                    const isOutOfStock = prod.stock_quantity <= 0;

                                    return (
                                        <button
                                            key={prod.id}
                                            disabled={isOutOfStock}
                                            onClick={() => addToCart(prod)}
                                            className={`group relative text-left bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between h-[150px] transition-all duration-200 select-none shadow-md ${
                                                isOutOfStock 
                                                    ? 'opacity-40 border-slate-900 cursor-not-allowed' 
                                                    : isLowStock 
                                                        ? 'border-orange-500/50 hover:bg-slate-800/80 hover:border-orange-500' 
                                                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                                            }`}
                                        >
                                            {/* Top Line: Name & Category */}
                                            <div className="space-y-1">
                                                <div className="flex items-start justify-between gap-1">
                                                    <span className="font-semibold text-slate-200 text-xs line-clamp-2 leading-tight">
                                                        {prod.name}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-mono block">
                                                    SKU: {prod.sku}
                                                </span>
                                            </div>

                                            {/* Bottom Line: Price & Stock Status */}
                                            <div className="flex items-end justify-between mt-3 pt-2 border-t border-slate-800/40">
                                                <span className="font-bold text-sm text-brand-300 font-mono">
                                                    ${parseFloat(prod.retail_price).toFixed(2)}
                                                </span>

                                                {/* Stock badge */}
                                                {isOutOfStock ? (
                                                    <span className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold px-1.5 py-0.5 rounded-md">
                                                        Sold Out
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold px-1.5 py-0.5 rounded-md animate-pulse">
                                                        Low Stock ({prod.stock_quantity})
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] text-slate-400 bg-slate-800 border border-slate-700 font-medium px-1.5 py-0.5 rounded-md">
                                                        Stock: {prod.stock_quantity}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: SHOPPING CART */}
                <div className="w-full md:w-[380px] lg:w-[420px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-lg shrink-0">
                    
                    {/* Cart Header */}
                    <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">
                            Active Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                        </span>
                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-slate-500 hover:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                                <Trash2 className="w-4 h-4" /> Clear All
                            </button>
                        )}
                    </div>

                    {/* Cart Item List */}
                    <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-800/40">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                <div className="w-12 h-12 rounded-full bg-slate-850 flex items-center justify-center text-slate-600 mb-3 border border-slate-800">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="text-slate-400 font-semibold text-sm">Cart is Empty</span>
                                <p className="text-xs text-slate-500 max-w-xs mt-1">
                                    Click products from the grid or scan a barcode to initiate checkout.
                                </p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="py-3 flex items-center justify-between gap-4 group">
                                    {/* Item meta */}
                                    <div className="flex-1 min-w-0">
                                        <span className="text-slate-200 text-xs font-bold block truncate">
                                            {item.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            ${parseFloat(item.retail_price).toFixed(2)} each
                                        </span>
                                    </div>

                                    {/* Item Quantity control */}
                                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-850 rounded-xl">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="w-6 text-center font-mono font-bold text-xs text-slate-200">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Price and delete */}
                                    <div className="text-right flex items-center gap-3">
                                        <span className="font-bold text-xs text-slate-200 font-mono w-16">
                                            ${(parseFloat(item.retail_price) * item.quantity).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Cart Calculations Summary */}
                    <div className="bg-slate-950/60 border-t border-slate-800 p-5 space-y-4">
                        <div className="space-y-2 text-xs text-slate-400">
                            {/* Subtotal */}
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-mono text-slate-300 font-semibold">${cartTotal.toFixed(2)}</span>
                            </div>

                            {/* Tax Rate (Fixed 10%) */}
                            <div className="flex justify-between">
                                <span>Tax (10%)</span>
                                <span className="font-mono text-slate-300 font-semibold">${tax.toFixed(2)}</span>
                            </div>

                            {/* Discount Input Row */}
                            <div className="flex items-center justify-between gap-4 pt-1">
                                <span className="shrink-0">Discount ($)</span>
                                <div className="relative w-28 shrink-0">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[10px]">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={cartTotal + tax}
                                        value={discountInput}
                                        onChange={(e) => setDiscountInput(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-5 pr-2 py-1.5 bg-slate-950 text-slate-200 font-mono text-xs text-right rounded-lg border border-slate-800 focus:outline-none focus:border-brand-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Grand Total */}
                        <div className="flex items-end justify-between border-t border-slate-800 pt-3">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Amount Due</span>
                            <span className="font-mono text-2xl font-extrabold text-brand-300">${grandTotal.toFixed(2)}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            {/* Suspend Cart */}
                            <button
                                onClick={handleSuspendCart}
                                disabled={cart.length === 0}
                                className={`py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-[0.98] ${
                                    cart.length === 0
                                        ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300'
                                }`}
                            >
                                <Pause className="w-4 h-4" /> Suspend
                            </button>

                            {/* Checkout */}
                            <button
                                onClick={() => setIsCheckoutOpen(true)}
                                disabled={cart.length === 0}
                                className={`py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
                                    cart.length === 0
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                                        : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/10'
                                }`}
                            >
                                <CreditCard className="w-4 h-4" /> Pay & Print
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            {/* SUSPENDED CARTS DRAWER / OVERLAY */}
            {showSuspendedDrawer && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm no-print">
                    <div className="w-full max-w-md bg-slate-900 border-l border-slate-850 h-full shadow-2xl flex flex-col">
                        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-100 uppercase tracking-wider text-sm flex items-center gap-2">
                                <FolderSync className="w-5 h-5 text-brand-400" />
                                Suspended Carts
                            </h3>
                            <button 
                                onClick={() => setShowSuspendedDrawer(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* List of Suspended Carts */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {suspendedCarts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <FolderSync className="w-10 h-10 text-slate-700 mb-2" />
                                    <span className="text-slate-400 font-bold text-sm">No Suspended Sales</span>
                                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                                        Carts held mid-transaction will appear here to be retrieved later.
                                    </p>
                                </div>
                            ) : (
                                suspendedCarts.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs text-slate-400 font-mono block">
                                                    {new Date(item.timestamp).toLocaleString()}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-300">
                                                    {item.items.reduce((sum, i) => sum + i.quantity, 0)} Items
                                                </span>
                                            </div>
                                            <span className="font-mono text-sm font-bold text-brand-300">
                                                ${parseFloat(item.total).toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRestoreCart(item)}
                                                className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" /> Restore
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSuspended(item.id)}
                                                className="py-2 px-3 bg-slate-800 hover:bg-rose-500/20 active:scale-95 border border-slate-750 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                                                title="Delete Suspended Cart"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST SYSTEM */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce no-print">
                    <div className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold ${
                        toast.type === 'error' 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${
                            toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}></span>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Checkout modal overlay */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cartTotal={cartTotal}
                tax={tax}
                discount={discount}
                items={cart}
                onOrderSuccess={handleOrderSuccess}
            />

        </div>
    );
}
