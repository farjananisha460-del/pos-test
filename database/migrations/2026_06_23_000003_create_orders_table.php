<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2)->default(0.00);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('grand_total', 10, 2);
            $table->string('payment_method')->default('cash'); // cash, card, bkash, nagad, rocket, bank_transfer, gift_card
            $table->decimal('cash_received', 10, 2)->nullable();
            $table->decimal('change_given', 10, 2)->nullable();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('coupon_id')->nullable()->constrained('coupons')->nullOnDelete();
            $table->foreignId('cashier_id')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
