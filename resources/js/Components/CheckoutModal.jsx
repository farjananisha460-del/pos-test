import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, 
    Landmark, 
    DollarSign, 
    Receipt, 
    Printer, 
    CheckCircle, 
    AlertTriangle,
    Smartphone,
    CreditCard,
    Gift,
    Hash
} from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, cartTotal, tax, discount, items, customerId, couponCode, onOrderSuccess }) {
    if (!isOpen) return null;

    const grandTotal = Math.max(0, cartTotal + tax - discount);

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutCompleted, setCheckoutCompleted] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);
    const [backendError, setBackendError] = useState(null);

    // Calculate change due
    const cashValue = parseFloat(cashReceived) || 0;
    const changeDue = cashValue >= grandTotal ? cashValue - grandTotal : 0;
    const isCashInsufficient = paymentMethod === 'cash' && cashValue < grandTotal;

    const quickCashOptions = [
        { label: 'Exact Amount', value: grandTotal },
        { label: '$5.00', value: 5.00 },
        { label: '$10.00', value: 10.00 },
        { label: '$20.00', value: 20.00 },
        { label: '$50.00', value: 50.00 },
        { label: '$100.00', value: 100.00 },
    ].filter(opt => opt.value >= grandTotal || opt.label === 'Exact Amount');

    const handleNumpad = (val) => {
        if (val === 'C') {
            setCashReceived('');
        } else if (val === '⌫') {
            setCashReceived(prev => prev.slice(0, -1));
        } else if (val === '.') {
            if (!cashReceived.includes('.')) {
                setCashReceived(prev => prev + '.');
            }
        } else {
            if (cashReceived.includes('.') && cashReceived.split('.')[1].length >= 2) {
                return;
            }
            setCashReceived(prev => prev + val);
        }
    };

    const handleSubmit = () => {
        if (isProcessing) return;
        setBackendError(null);

        if (paymentMethod === 'cash' && isCashInsufficient) {
            setBackendError('Cash received is less than the grand total.');
            return;
        }

        setIsProcessing(true);

        router.post('/orders', {
            items: items.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            })),
            discount: discount,
            tax: tax,
            payment_method: paymentMethod,
            cash_received: paymentMethod === 'cash' ? cashValue : null,
            customer_id: customerId,
            coupon_code: couponCode,
            transaction_id: transactionId
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setIsProcessing(false);
                const order = page.props.flash?.last_order;
                if (order) {
                    setCompletedOrder(order);
                    setCheckoutCompleted(true);
                    onOrderSuccess(order);
                } else {
                    setCheckoutCompleted(true);
                    onOrderSuccess(null);
                }
            },
            onError: (errs) => {
                setIsProcessing(false);
                const firstError = Object.values(errs)[0];
                setBackendError(firstError || 'Failed to complete transaction.');
            }
        });
    };

    const triggerPrint = () => {
        window.print();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !checkoutCompleted) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, checkoutCompleted]);

    const payMethods = [
        { id: 'cash', label: 'Cash', icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
        { id: 'card', label: 'Card', icon: CreditCard, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        { id: 'bkash', label: 'bKash', icon: Smartphone, color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
        { id: 'nagad', label: 'Nagad', icon: Smartphone, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
        { id: 'rocket', label: 'Rocket', icon: Smartphone, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
        { id: 'bank_transfer', label: 'Bank', icon: Landmark, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
        { id: 'gift_card', label: 'Gift Card', icon: Gift, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm no-print">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-blue-400" />
                        {checkoutCompleted ? 'Transaction Complete' : 'Process Checkout'}
                    </h3>
                    {!checkoutCompleted && (
                        <button 
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-850 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {checkoutCompleted ? (
                    /* SUCCESS SCREEN */
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6">
                        <CheckCircle className="w-20 h-20 text-emerald-400 animate-bounce" />
                        <div>
                            <h2 className="text-2xl font-bold text-slate-100">Sale Logged Successfully!</h2>
                            <p className="text-slate-400 mt-1">Invoice Number: <span className="font-bold text-blue-400">{completedOrder?.invoice_number}</span></p>
                        </div>

                        {completedOrder?.payment_method === 'cash' && (
                            <div className="p-4 bg-slate-850 border border-slate-800 rounded-2xl w-full max-w-md shadow-sm">
                                <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">CHANGE DUE TO CUSTOMER</span>
                                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                                    ${parseFloat(completedOrder.change_given).toFixed(2)}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                            <button
                                onClick={triggerPrint}
                                className="flex-1 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                            >
                                <Printer className="w-5 h-5" /> Print Receipt
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3.5 px-6 bg-slate-850 hover:bg-slate-800 active:scale-95 text-slate-100 font-bold rounded-xl transition-all border border-slate-800"
                            >
                                Next Transaction
                            </button>
                        </div>
                    </div>
                ) : (
                    /* CHECKOUT TERMINAL */
                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        
                        {/* Left Column: Payment Details */}
                        <div className="flex-1 p-6 border-r border-slate-800 overflow-y-auto space-y-5">
                            
                            {/* Payment Method Selectors */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                                    Select Payment Channel
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {payMethods.map((pm) => {
                                        const PMIcon = pm.icon;
                                        const isSelected = paymentMethod === pm.id;
                                        return (
                                            <button
                                                key={pm.id}
                                                onClick={() => {
                                                    setPaymentMethod(pm.id);
                                                    setCashReceived('');
                                                }}
                                                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                                                    isSelected 
                                                        ? 'border-blue-600 bg-blue-600/15 text-blue-400' 
                                                        : 'border-slate-850 bg-slate-950/40 text-slate-400 hover:bg-slate-850'
                                                }`}
                                            >
                                                <PMIcon className="w-5 h-5" />
                                                <span className="font-extrabold text-[11px] uppercase tracking-wider">{pm.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {paymentMethod === 'cash' ? (
                                <div className="space-y-4">
                                    {/* Cash Received Inputs */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                            Cash Received Amount
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-2xl font-semibold">$</span>
                                            <input
                                                type="text"
                                                readOnly
                                                value={cashReceived}
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-4 py-3 bg-slate-950 text-slate-100 font-mono text-2xl font-bold rounded-xl border border-slate-850 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Cash Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        {quickCashOptions.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCashReceived(opt.value.toFixed(2))}
                                                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-850 hover:bg-slate-800 active:scale-95 text-slate-300 border border-slate-800 transition-all"
                                            >
                                                {opt.label === 'Exact Amount' ? 'Exact' : opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Touch Numpad */}
                                    <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto pt-2">
                                        {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', 'C'].map((char) => (
                                            <button
                                                key={char}
                                                onClick={() => handleNumpad(char)}
                                                className={`py-3 text-lg font-bold font-mono rounded-lg transition-all active:scale-90 border select-none ${
                                                    char === 'C' 
                                                        ? 'bg-red-500/10 hover:bg-red-500/20 border-red-900/40 text-red-400' 
                                                        : 'bg-slate-850 hover:bg-slate-800 border-slate-800/40 text-slate-200'
                                                }`}
                                            >
                                                {char}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handleNumpad('⌫')}
                                            className="col-span-3 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800/40 text-slate-200 rounded-lg font-bold transition-all active:scale-95"
                                        >
                                            Backspace
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Mobile Banking & Card transactional IDs */
                                <div className="space-y-4 pt-2">
                                    <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl text-center space-y-2">
                                        <Smartphone className="w-10 h-10 text-slate-500 mx-auto" />
                                        <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">Mobile Wallet Transaction Details</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Request the customer to scan the payment QR code or transfer the total of <span className="font-extrabold text-blue-400">${grandTotal.toFixed(2)}</span>. Log their reference number below.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                            Reference / Transaction ID
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                                <Hash className="w-4 h-4" />
                                            </span>
                                            <input
                                                type="text"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                placeholder="e.g. TXN100234589"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-950 text-slate-100 rounded-xl border border-slate-850 focus:outline-none focus:border-blue-600 text-xs font-semibold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Right Column: Invoice Summary */}
                        <div className="w-full lg:w-[350px] p-6 bg-slate-950/30 flex flex-col justify-between space-y-6">
                            
                            <div className="space-y-4 flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Checkout Invoice
                                </label>

                                <div className="space-y-2.5 text-xs text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-mono font-bold">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (10%)</span>
                                        <span className="font-mono font-bold">${tax.toFixed(2)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-emerald-400 font-semibold">
                                            <span>Discount</span>
                                            <span className="font-mono">-${discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-bold text-slate-100">
                                        <span>Total Payable</span>
                                        <span className="font-mono text-lg text-blue-400">${grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {paymentMethod === 'cash' && (
                                    <div className="pt-4 border-t border-slate-800/60 space-y-3">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-slate-400">Cash Received</span>
                                            <span className="font-mono text-slate-200">${cashValue.toFixed(2)}</span>
                                        </div>
                                        {isCashInsufficient ? (
                                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
                                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                                <span>Insufficient. Missing ${(grandTotal - cashValue).toFixed(2)}</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between text-xs font-bold text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                                <span>Change Due</span>
                                                <span className="font-mono">${changeDue.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {backendError && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] leading-normal flex items-start gap-2 font-bold">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{backendError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Submit actions */}
                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isProcessing || isCashInsufficient}
                                    className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
                                        isProcessing || isCashInsufficient
                                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-slate-350 border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Checkout'
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={isProcessing}
                                    className="w-full py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                                >
                                    Close
                                </button>
                            </div>

                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
