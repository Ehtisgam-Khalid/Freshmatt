<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->string('emoji', 10)->nullable();
            $t->timestamps();
        });

        Schema::create('products', function (Blueprint $t) {
            $t->id();
            $t->foreignId('category_id')->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->string('slug')->unique();
            $t->text('description')->nullable();
            $t->decimal('price', 10, 2);
            $t->string('unit', 30)->default('1 kg');
            $t->string('emoji', 10)->nullable();
            $t->unsignedInteger('stock')->default(100);
            $t->boolean('featured')->default(false);
            $t->timestamps();
        });

        Schema::create('orders', function (Blueprint $t) {
            $t->id();
            $t->string('order_number')->unique();
            $t->string('customer_name');
            $t->string('phone', 30);
            $t->string('email')->nullable();
            $t->text('address');
            $t->string('city', 100);
            $t->text('notes')->nullable();
            $t->string('payment_method', 20)->default('cod');
            $t->decimal('subtotal', 10, 2);
            $t->decimal('delivery_fee', 10, 2)->default(0);
            $t->decimal('total', 10, 2);
            $t->string('status', 20)->default('pending');
            $t->timestamps();
        });

        Schema::create('order_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->constrained()->cascadeOnDelete();
            $t->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $t->string('product_name');
            $t->decimal('price', 10, 2);
            $t->unsignedInteger('quantity');
            $t->decimal('line_total', 10, 2);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
