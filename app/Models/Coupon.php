<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'expiry_date',
        'active'
    ];

    public function isValid()
    {
        return $this->active && $this->expiry_date >= date('Y-m-d');
    }

    public function calculateDiscount($subtotal)
    {
        if ($this->type === 'percent') {
            return ($subtotal * $this->value) / 100;
        }
        return min($this->value, $subtotal);
    }
}
