<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:120',
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]{7,20}$/'],
            'email' => 'nullable|email|max:150',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'notes' => 'nullable|string|max:500',
            'items' => 'required|array|min:1|max:60',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:50',
        ]);

        $order = DB::transaction(function () use ($data) {
            $subtotal = 0;
            $lines = [];

            foreach ($data['items'] as $item) {
                // Price hamesha database se - client par bharosa nahi
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $qty = (int) $item['quantity'];

                if ($product->stock < $qty) {
                    abort(response()->json([
                        'message' => "{$product->name} ka itna stock available nahi hai.",
                    ], 422));
                }

                $lineTotal = $product->price * $qty;
                $subtotal += $lineTotal;
                $product->decrement('stock', $qty);

                $lines[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name.' ('.$product->unit.')',
                    'price' => $product->price,
                    'quantity' => $qty,
                    'line_total' => $lineTotal,
                ];
            }

            $fee = $subtotal >= config('shop.free_delivery_above') ? 0 : config('shop.delivery_fee');

            $order = Order::create([
                'order_number' => 'FM-'.now()->format('ymd').'-'.strtoupper(Str::random(5)),
                'customer_name' => $data['customer_name'],
                'phone' => $data['phone'],
                'email' => $data['email'] ?? null,
                'address' => $data['address'],
                'city' => $data['city'],
                'notes' => $data['notes'] ?? null,
                'payment_method' => 'cod',
                'subtotal' => $subtotal,
                'delivery_fee' => $fee,
                'total' => $subtotal + $fee,
                'status' => 'pending',
            ]);

            $order->items()->createMany($lines);

            return $order;
        });

        return response()->json($order->load('items'), 201);
    }

    public function show(string $orderNumber)
    {
        $order = Order::with('items')->where('order_number', $orderNumber)->firstOrFail();

        return [
            'order_number' => $order->order_number,
            'status' => $order->status,
            'customer_name' => $order->customer_name,
            'total' => $order->total,
            'created_at' => $order->created_at,
            'items' => $order->items,
        ];
    }
}
