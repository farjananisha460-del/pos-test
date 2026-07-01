<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'subtotal',
        'tax',
        'discount',
        'grand_total',
        'payment_method',
        'cash_received',
        'change_given',
        'customer_id',
        'coupon_id',
        'cashier_id',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'cash_received' => 'decimal:2',
        'change_given' => 'decimal:2',
    ];

    /**
     * Get the customer associated with the order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the coupon used in this order.
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Get the cashier (user) who processed the order.
     */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * Get the items in this order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
