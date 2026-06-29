import React from 'react';

export default function ReceiptPrint({ order }) {
    if (!order) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    return (
        <div className="print-only hidden font-mono text-[11px] text-black bg-white leading-tight">
            {/* Store Header */}
            <div className="text-center mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider">ANTIGRAVITY POS</h2>
                <p>123 Innovation Boulevard</p>
                <p>Silicon Valley, CA 94025</p>
                <p>Tel: (555) 019-2834</p>
                <p>www.antigravitypos.com</p>
            </div>

            {/* Transaction metadata */}
            <div className="border-b border-dashed border-black pb-2 mb-2">
                <p><span className="font-bold">Invoice:</span> {order.invoice_number}</p>
                <p><span className="font-bold">Date:</span> {formatDate(order.created_at || new Date())}</p>
                <p><span className="font-bold">Cashier:</span> {order.cashier?.name || 'System User'}</p>
            </div>

            {/* Sales items */}
            <div className="border-b border-dashed border-black pb-2 mb-2">
                <div className="flex justify-between font-bold mb-1">
                    <span className="w-[50%]">Item Description</span>
                    <span className="w-[15%] text-right">Qty</span>
                    <span className="w-[15%] text-right">Price</span>
                    <span className="w-[20%] text-right">Total</span>
                </div>
                {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between py-0.5">
                        <span className="w-[50%] truncate">{item.product?.name}</span>
                        <span className="w-[15%] text-right">{item.quantity}</span>
                        <span className="w-[15%] text-right">${parseFloat(item.historical_unit_price).toFixed(2)}</span>
                        <span className="w-[20%] text-right">
                            ${(item.quantity * parseFloat(item.historical_unit_price)).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                {parseFloat(order.tax) > 0 && (
                    <div className="flex justify-between">
                        <span>Tax (10%):</span>
                        <span>${parseFloat(order.tax).toFixed(2)}</span>
                    </div>
                )}
                {parseFloat(order.discount) > 0 && (
                    <div className="flex justify-between font-semibold text-black">
                        <span>Discount:</span>
                        <span>-${parseFloat(order.discount).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-xs uppercase pt-1 border-t border-dotted border-black">
                    <span>Grand Total:</span>
                    <span>${parseFloat(order.grand_total).toFixed(2)}</span>
                </div>
            </div>

            {/* Payment Details */}
            <div className="pb-2 mb-4 leading-normal">
                <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-bold uppercase">{order.payment_method}</span>
                </div>
                {order.payment_method === 'cash' && (
                    <>
                        <div className="flex justify-between">
                            <span>Cash Received:</span>
                            <span>${parseFloat(order.cash_received).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Change Given:</span>
                            <span>${parseFloat(order.change_given).toFixed(2)}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Receipt Footer */}
            <div className="text-center pt-2 border-t border-dashed border-black">
                <p className="font-bold mb-1">THANK YOU FOR YOUR PURCHASE!</p>
                <p>Please retain your receipt for refunds.</p>
                <p className="text-[9px] mt-2 text-gray-500">System powered by Antigravity POS</p>
                
                {/* Visual indicator of barcode scan */}
                <div className="mt-3 mx-auto w-40 h-8 bg-black flex items-center justify-center text-white text-[8px] tracking-[6px] select-none font-sans">
                    *{order.invoice_number.split('-')[2] || 'SALE'}*
                </div>
            </div>
        </div>
    );
}
