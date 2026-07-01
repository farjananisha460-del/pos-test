import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Search, 
    Trash2, 
    Plus, 
    Minus, 
    Pause, 
    FolderSync, 
    CreditCard, 
    ChevronRight,
    AlertTriangle,
    RotateCcw,
    Mic,
    Tag,
    UserPlus,
    X,
    FolderPlus
} from 'lucide-react';
import useBarcodeScanner from '@/Hooks/useBarcodeScanner';
import CheckoutModal from '@/Components/CheckoutModal';
import ReceiptPrint from '@/Components/ReceiptPrint';

export default function POS({ categories, products, customers, coupons }) {
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [notes, setNotes] = useState('');
    const [toast, setToast] = useState(null);

    // Filter properties
    const [priceRange, setPriceRange] = useState('all'); // all, low (0-5), mid (5-20), high (20+)
    const [isListening, setIsListening] = useState(false);

    // Suspended carts state
    const [suspendedCarts, setSuspendedCarts] = useState([]);
    const [showSuspendedDrawer, setShowSuspendedDrawer] = useState(false);

    // Modal state
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);

    // Voice recognition ref
    const recognitionRef = useRef(null);

    // Toast manager
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Load suspended sales
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

    const saveSuspendedCarts = (newCarts) => {
        setSuspendedCarts(newCarts);
        localStorage.setItem('suspended_carts', JSON.stringify(newCarts));
    };

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
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            showToast(`Added ${product.name} to cart`);
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    // Barcode Listener integration
    useBarcodeScanner((barcode) => {
        const product = products.find(p => p.sku === barcode);
        if (product) {
            addToCart(product);
        } else {
            showToast(`Barcode "${barcode}" not found.`, 'error');
        }
    });

    // Voice Search Initialization
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const speechToText = event.results[0][0].transcript;
                setSearchQuery(speechToText);
                showToast(`Search query set to: "${speechToText}"`);
                setIsListening(false);
            };

            recognition.onerror = () => {
                showToast('Voice recognition failed or blocked.', 'error');
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleVoiceListening = () => {
        if (!recognitionRef.current) {
            showToast('Voice Search not supported in this browser.', 'error');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const updateQuantity = (id, delta) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.id === id) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return item;
                    
                    if (newQty > item.stock_quantity) {
                        showToast(`Only ${item.stock_quantity} units available.`, 'error');
                        return { ...item, quantity: item.stock_quantity };
                    }
                    return { ...item, quantity: newQty };
                }
                return item;
            });
        });
    };

    const removeFromCart = (id) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
        showToast('Item removed from cart.');
    };

    const clearCart = () => {
        setCart([]);
        setCouponCode('');
        setCouponDiscount(0);
        setSelectedCustomerId('');
        setNotes('');
        showToast('Cart cleared.');
    };

    // Subtotal math
    const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.retail_price) * item.quantity), 0);
    const taxRate = 0.10;
    const tax = cartTotal * taxRate;

    // Apply Coupon Discount
    const applyCoupon = () => {
        if (!couponCode) {
            setCouponDiscount(0);
            return;
        }
        const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
        if (coupon) {
            // Validate dates
            const isExpired = new Date(coupon.expiry_date) < new Date();
            if (isExpired || !coupon.active) {
                showToast('Coupon code has expired or is deactivated.', 'error');
                setCouponDiscount(0);
                return;
            }

            if (coupon.type === 'percent') {
                const disc = (cartTotal * parseFloat(coupon.value)) / 100;
                setCouponDiscount(disc);
            } else {
                setCouponDiscount(Math.min(parseFloat(coupon.value), cartTotal));
            }
            showToast('Discount coupon applied successfully!');
        } else {
            showToast('Invalid coupon code.', 'error');
            setCouponDiscount(0);
        }
    };

    const grandTotal = Math.max(0, cartTotal + tax - couponDiscount);

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
            discount: couponDiscount,
            couponCode: couponCode,
            customerId: selectedCustomerId,
            total: grandTotal
        };

        const updated = [newSuspendedCart, ...suspendedCarts];
        saveSuspendedCarts(updated);
        clearCart();
        showToast('Cart suspended successfully.');
    };

    // Restore Cart
    const handleRestoreCart = (suspended) => {
        if (cart.length > 0) {
            const confirmReplace = window.confirm("You have items in your cart. Merge them?");
            if (!confirmReplace) return;
        }

        setCart(prev => {
            const merged = [...prev];
            suspended.items.forEach(item => {
                const existing = merged.find(m => m.id === item.id);
                if (existing) {
                    existing.quantity = Math.min(existing.quantity + item.quantity, item.stock_quantity);
                } else {
                    merged.push(item);
                }
            });
            return merged;
        });

        if (suspended.couponCode) {
            setCouponCode(suspended.couponCode);
            setCouponDiscount(suspended.discount);
        }
        if (suspended.customerId) {
            setSelectedCustomerId(suspended.customerId);
        }

        const updated = suspendedCarts.filter(c => c.id !== suspended.id);
        saveSuspendedCarts(updated);
        setShowSuspendedDrawer(false);
        showToast('Suspended sale restored.');
    };

    const handleDeleteSuspended = (id) => {
        const updated = suspendedCarts.filter(c => c.id !== id);
        saveSuspendedCarts(updated);
        showToast('Suspended cart deleted.');
    };

    const handleOrderSuccess = (order) => {
        setCart([]);
        setCouponCode('');
        setCouponDiscount(0);
        setSelectedCustomerId('');
        setNotes('');
        if (order) {
            setLastOrder(order);
        }
    };

    // Filters logic
    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.category_id.toString() === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.sku.includes(searchQuery);
        
        let matchesPrice = true;
        if (priceRange === 'low') {
            matchesPrice = parseFloat(p.retail_price) <= 5;
        } else if (priceRange === 'mid') {
            matchesPrice = parseFloat(p.retail_price) > 5 && parseFloat(p.retail_price) <= 20;
        } else if (priceRange === 'high') {
            matchesPrice = parseFloat(p.retail_price) > 20;
        }

        return matchesCategory && matchesSearch && matchesPrice;
    });

    return (
        <AuthenticatedLayout>
            <Head title="POS Terminal" />

            {/* Hidden Receipt for Printing */}
            {lastOrder && <ReceiptPrint order={lastOrder} />}

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] overflow-hidden">
                
                {/* LEFT SIDE: CATALOG & FILTERS */}
                <div className="flex-1 flex flex-col space-y-4 overflow-hidden h-full">
                    
                    {/* Filter headers */}
                    <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 shadow-sm space-y-3 shrink-0">
                        {/* Search Input bar */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Search className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search products by SKU barcode or title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 placeholder-slate-500 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-xs font-bold transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        CLEAR
                                    </button>
                                )}
                            </div>

                            {/* Voice listener button */}
                            <button
                                onClick={toggleVoiceListening}
                                className={`p-2.5 rounded-xl border transition-all ${
                                    isListening 
                                        ? 'bg-red-500 border-red-500 text-white animate-pulse' 
                                        : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-400'
                                }`}
                                title="Voice Search"
                            >
                                <Mic className="w-4.5 h-4.5" />
                            </button>

                            {/* Suspended Sales Manager Trigger */}
                            <button
                                onClick={() => setShowSuspendedDrawer(true)}
                                className="relative p-2.5 rounded-xl border bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-200 dark:hover:bg-slate-850"
                                title="Suspended Draft Invoices"
                            >
                                <FolderSync className="w-4.5 h-4.5" />
                                {suspendedCarts.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-extrabold text-[9px] rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-slate-900">
                                        {suspendedCarts.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Extra filters: Price ranges & Categories */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            {/* Horizontal Categories */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin select-none max-w-full sm:max-w-[70%]">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase whitespace-nowrap transition-all border ${
                                        selectedCategory === 'all'
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    All Categories
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id.toString())}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase whitespace-nowrap transition-all border ${
                                            selectedCategory === cat.id.toString()
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* Price range tags */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850 shrink-0">
                                {['all', 'low', 'mid', 'high'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setPriceRange(range)}
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                            priceRange === range 
                                                ? 'bg-blue-600 text-white shadow-sm' 
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Products Card Grid scroll list */}
                    <div className="flex-1 overflow-y-auto pr-1">
                        {filteredProducts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30 p-8 text-center">
                                <AlertTriangle className="w-12 h-12 text-slate-500 mb-2" />
                                <h3 className="font-bold text-sm text-slate-600 dark:text-slate-350">No Products Available</h3>
                                <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-normal">
                                    There are no catalog products matching the search query "{searchQuery}" or price ranges.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                                {filteredProducts.map((prod) => {
                                    const isLowStock = prod.stock_quantity > 0 && prod.stock_quantity < 10;
                                    const isOutOfStock = prod.stock_quantity <= 0;

                                    return (
                                        <button
                                            key={prod.id}
                                            disabled={isOutOfStock}
                                            onClick={() => addToCart(prod)}
                                            className={`group relative text-left rounded-2xl p-4 flex flex-col justify-between h-[155px] transition-all duration-200 select-none border shadow-sm ${
                                                isOutOfStock 
                                                    ? 'opacity-40 border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-950/40 cursor-not-allowed' 
                                                    : isLowStock 
                                                        ? 'border-orange-500/40 bg-white dark:bg-slate-900 hover:border-orange-500 hover:shadow-md' 
                                                        : 'border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:border-blue-600 dark:hover:border-blue-600 hover:shadow-md'
                                            }`}
                                        >
                                            {/* Item Metadata */}
                                            <div className="space-y-1 w-full">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs line-clamp-2 leading-tight">
                                                        {prod.name}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-mono block">
                                                    SKU: {prod.sku}
                                                </span>
                                            </div>

                                            {/* Pricing & Stock indicators */}
                                            <div className="flex items-end justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/40 w-full">
                                                <span className="font-black text-sm text-blue-500 dark:text-blue-400 font-mono">
                                                    ${parseFloat(prod.retail_price).toFixed(2)}
                                                </span>

                                                {isOutOfStock ? (
                                                    <span className="text-[8px] bg-red-500/10 text-red-500 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                        Sold Out
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="text-[8px] bg-orange-500/10 text-orange-500 font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                                        Low ({prod.stock_quantity})
                                                    </span>
                                                ) : (
                                                    <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded">
                                                        Qty: {prod.stock_quantity}
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

                {/* RIGHT SIDE: SHOPPING CART PANEL */}
                <div className="w-full lg:w-[400px] border rounded-2xl flex flex-col overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 shadow-sm shrink-0 h-full">
                    
                    {/* Cart Header */}
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                        <span className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2">
                            Checkout Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                        </span>
                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-red-500 hover:text-red-600 text-[10px] font-extrabold uppercase transition-colors flex items-center gap-1"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Clear
                            </button>
                        )}
                    </div>

                    {/* Cart Item rows list */}
                    <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-100 dark:divide-slate-800/40">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-400 mb-3 border border-slate-200 dark:border-slate-800">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span className="text-slate-400 dark:text-slate-350 font-bold text-xs">Cart is empty.</span>
                                <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-normal">
                                    Select items from the catalog or read barcodes to begin.
                                </p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="py-3 flex items-center justify-between gap-3 group">
                                    <div className="flex-1 min-w-0">
                                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block truncate leading-snug">
                                            {item.name}
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-mono">
                                            ${parseFloat(item.retail_price).toFixed(2)} /unit
                                        </span>
                                    </div>

                                    {/* Item Quantity stepper */}
                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-850 rounded-xl">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-5 text-center font-mono font-bold text-[11px] text-slate-700 dark:text-slate-255">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Price & Delete Column */}
                                    <div className="text-right flex items-center gap-3">
                                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 font-mono w-14">
                                            ${(parseFloat(item.retail_price) * item.quantity).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Cart Summary & Actions */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 p-5 space-y-4">
                        
                        {/* Customer & Coupon settings */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Customer Select dropdown */}
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Customer CRM</label>
                                <select
                                    value={selectedCustomerId}
                                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold focus:outline-none"
                                >
                                    <option value="">Walk-in Customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.membership_level})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Coupon input */}
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Coupon Promo</label>
                                <div className="flex gap-1.5">
                                    <input
                                        type="text"
                                        placeholder="CODE"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold focus:outline-none uppercase"
                                    />
                                    <button
                                        onClick={applyCoupon}
                                        className="px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase transition-all"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Order Notes */}
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Invoicing Notes</label>
                            <input
                                type="text"
                                placeholder="Add customer details, delivery remarks, etc..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold focus:outline-none"
                            />
                        </div>

                        {/* Invoice Summary */}
                        <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
                            <div className="flex justify-between text-[11px] font-semibold">
                                <span>Subtotal</span>
                                <span className="font-mono text-slate-700 dark:text-slate-200">${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-semibold">
                                <span>Tax (10%)</span>
                                <span className="font-mono text-slate-700 dark:text-slate-200">${tax.toFixed(2)}</span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-[11px] font-bold text-emerald-500">
                                    <span>Discount</span>
                                    <span className="font-mono">-${couponDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-800 dark:text-slate-100 font-bold">
                                <span className="text-[10px] uppercase tracking-wider">Amount Due</span>
                                <span className="font-mono text-xl text-blue-500 dark:text-blue-400">${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <button
                                onClick={handleSuspendCart}
                                disabled={cart.length === 0}
                                className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-[0.98] ${
                                    cart.length === 0
                                        ? 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed'
                                        : 'bg-slate-100 dark:bg-slate-850 border-slate-350 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Pause className="w-4 h-4" /> HOLD SALE
                            </button>

                            <button
                                onClick={() => setIsCheckoutOpen(true)}
                                disabled={cart.length === 0}
                                className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-sm ${
                                    cart.length === 0
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'
                                }`}
                            >
                                <CreditCard className="w-4 h-4" /> PAY & INVOICE
                            </button>
                        </div>

                    </div>
                </div>

            </div>

            {/* SUSPENDED DRAFTS DRAWER */}
            {showSuspendedDrawer && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm no-print">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-850 h-full shadow-2xl flex flex-col">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
                                <FolderSync className="w-5 h-5 text-blue-500" />
                                Suspended Draft Transactions
                            </h3>
                            <button 
                                onClick={() => setShowSuspendedDrawer(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {suspendedCarts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <FolderSync className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-slate-500 font-bold text-xs">No active drafts.</span>
                                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                                        Sales put on hold will display here for cashier retrieval.
                                    </p>
                                </div>
                            ) : (
                                suspendedCarts.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 space-y-3"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[9px] text-slate-400 font-mono block">
                                                    {new Date(item.timestamp).toLocaleString()}
                                                </span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
                                                    {item.items.reduce((sum, i) => sum + i.quantity, 0)} items on hold
                                                </span>
                                            </div>
                                            <span className="font-mono text-sm font-extrabold text-blue-500 dark:text-blue-450">
                                                ${parseFloat(item.total).toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRestoreCart(item)}
                                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" /> Resume Sale
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSuspended(item.id)}
                                                className="py-2 px-3 bg-slate-200 dark:bg-slate-850 hover:bg-red-500/10 active:scale-95 border border-slate-300 dark:border-slate-750 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded-xl transition-all"
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

            {/* TOAST NOTIFICATION POPUP */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce">
                    <div className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold ${
                        toast.type === 'error' 
                            ? 'bg-red-500/10 border-red-500/25 text-red-500' 
                            : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                            toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
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
                discount={couponDiscount}
                items={cart}
                customerId={selectedCustomerId}
                couponCode={couponCode}
                onOrderSuccess={handleOrderSuccess}
            />
        </AuthenticatedLayout>
    );
}
