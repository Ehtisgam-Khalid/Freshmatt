<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'customer_name', 'phone', 'email', 'address', 'city',
        'notes', 'payment_method', 'subtotal', 'delivery_fee', 'total', 'status',
    ];

    protected $casts = ['subtotal' => 'float', 'delivery_fee' => 'float', 'total' => 'float'];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
