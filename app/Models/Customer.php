<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'reward_points',
        'membership_level',
        'balance_due'
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
