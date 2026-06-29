import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, Landmark, DollarSign, Receipt, Printer, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, cartTotal, tax, discount, items, onOrderSuccess }) {
    if (!isOpen) return null;

    const grandTotal = Math.max(0, cartTotal + tax - discount);

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutCompleted, setCheckoutCompleted] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);
    const [backendError, setBackendError] = useState(null);

    // Calculate change due
    const cashValue = parseFloat(cashReceived) || 0;
    const changeDue = cashValue >= grandTotal ? cashValue - grandTotal : 0;
    const isCashInsufficient = paymentMethod === 'cash' && cashValue < grandTotal;

    // Quick cash shortcuts
    const quickCashOptions = [
        { label: 'Exact Amount', value: grandTotal },
        { label: '$5.00', value: 5.00 },
        { label: '$10.00', value: 10.00 },
        { label: '$20.00', value: 20.00 },
        { label: '$50.00', value: 50.00 },
        { label: '$100.00', value: 100.00 },
    ].filter(opt => opt.value >= grandTotal || opt.label === 'Exact Amount');

    // Handle Numpad Clicks
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
            // Prevent entering multiple decimals or excessively large numbers
            if (cashReceived.includes('.') && cashReceived.split('.')[1].length >= 2) {
                return;
            }
            setCashReceived(prev => prev + val);
        }
    };

    // Submitting transaction to backend
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
            cash_received: paymentMethod === 'cash' ? cashValue : null
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setIsProcessing(false);
                // Check if last_order was flashed into session
                const order = page.props.flash?.last_order;
                if (order) {
                    setCompletedOrder(order);
                    setCheckoutCompleted(true);
                    // Pass up to dashboard to clear cart
                    onOrderSuccess(order);
                } else {
                    // Fallback reset if session flash isn't populated
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

    // Trigger Print layout
    const triggerPrint = () => {
        window.print();
    };

    // Handle keypresses for modal shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !checkoutCompleted) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, checkoutCompleted]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm no-print">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-brand-400" />
                        {checkoutCompleted ? 'Transaction Complete' : 'Process Checkout'}
                    </h3>
                    {!checkoutCompleted && (
                        <button 
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
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
                            <h2 className="text-2xl font-bold text-slate-100">Sale Successfully Logged!</h2>
                            <p className="text-slate-400 mt-1">Invoice Number: <span className="font-semibold text-brand-300">{completedOrder?.invoice_number}</span></p>
                        </div>

                        {completedOrder?.payment_method === 'cash' && (
                            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl w-full max-w-md">
                                <span className="text-slate-400 text-sm block">CHANGE TO RETURN</span>
                                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                                    ${parseFloat(completedOrder.change_given).toFixed(2)}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                            <button
                                onClick={triggerPrint}
                                className="flex-1 py-3.5 px-6 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                            >
                                <Printer className="w-5 h-5" /> Print Receipt
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3.5 px-6 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-semibold rounded-xl transition-all border border-slate-700"
                            >
                                New Customer
                            </button>
                        </div>
                    </div>
                ) : (
                    /* CHECKOUT TERMINAL */
                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        
                        {/* Left Column: Payment Details */}
                        <div className="flex-1 p-6 border-r border-slate-800 overflow-y-auto space-y-6">
                            
                            {/* Payment Method Selectors */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                                            paymentMethod === 'cash' 
                                                ? 'border-brand-500 bg-brand-500/10 text-brand-300' 
                                                : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <DollarSign className="w-7 h-7" />
                                        <span className="font-semibold text-sm">CASH</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setPaymentMethod('card');
                                            setCashReceived(''); // Clear cash input if card
                                        }}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                                            paymentMethod === 'card' 
                                                ? 'border-brand-500 bg-brand-500/10 text-brand-300' 
                                                : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <Landmark className="w-7 h-7" />
                                        <span className="font-semibold text-sm">CARD</span>
                                    </button>
                                </div>
                            </div>

                            {paymentMethod === 'cash' ? (
                                <div className="space-y-4">
                                    {/* Cash Received Inputs */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                                            Cash Received
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-2xl font-semibold">$</span>
                                            <input
                                                type="text"
                                                readOnly
                                                value={cashReceived}
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-4 py-3 bg-slate-950 text-slate-100 font-mono text-2xl font-bold rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Cash Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        {quickCashOptions.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCashReceived(opt.value.toFixed(2))}
                                                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700 transition-all"
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
                                                        ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-900/50 text-rose-300' 
                                                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700/50 text-slate-200'
                                                }`}
                                            >
                                                {char}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handleNumpad('⌫')}
                                            className="col-span-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-200 rounded-lg font-bold transition-all active:scale-95"
                                        >
                                            Backspace
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Card instructions */
                                <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-xl text-center space-y-3">
                                    <Landmark className="w-12 h-12 text-slate-500 mx-auto" />
                                    <h4 className="text-slate-200 font-bold">Credit/Debit Payment Terminal</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Swipe, insert, or tap the customer's card on the connected POS card reader. Click 'Process Sale' below once the terminal registers authorization.
                                    </p>
                                </div>
                            )}

                        </div>

                        {/* Right Column: Invoice Summary */}
                        <div className="w-full lg:w-[350px] p-6 bg-slate-950/40 flex flex-col justify-between space-y-6">
                            
                            {/* Summaries */}
                            <div className="space-y-4 flex-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                    Invoice Summary
                                </label>

                                <div className="space-y-2 text-sm text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-mono">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (10%)</span>
                                        <span className="font-mono">${tax.toFixed(2)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-emerald-400">
                                            <span>Discount</span>
                                            <span className="font-mono">-${discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-slate-800 pt-3 text-base font-bold text-slate-100">
                                        <span>Total Due</span>
                                        <span className="font-mono text-xl text-brand-300">${grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Math calculations for Cash change */}
                                {paymentMethod === 'cash' && (
                                    <div className="pt-4 border-t border-slate-800 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Cash Tendered</span>
                                            <span className="font-mono font-semibold text-slate-300">${cashValue.toFixed(2)}</span>
                                        </div>
                                        {isCashInsufficient ? (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                                <span>Insufficient funds. Short of ${(grandTotal - cashValue).toFixed(2)}</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between text-base font-bold text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                                                <span>Change Due</span>
                                                <span className="font-mono">${changeDue.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Error messages */}
                                {backendError && (
                                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs leading-normal flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{backendError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Submit block */}
                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isProcessing || isCashInsufficient}
                                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
                                        isProcessing || isCashInsufficient
                                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                                            : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        'Process Sale'
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={isProcessing}
                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 rounded-xl font-semibold text-sm transition-all"
                                >
                                    Cancel
                                </button>
                            </div>

                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
