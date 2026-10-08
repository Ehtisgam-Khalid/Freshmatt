<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function categories()
    {
        return Category::orderBy('id')->get(['id', 'name', 'slug', 'emoji']);
    }

    public function products(Request $request)
    {
        $q = Product::with('category:id,name,slug')->where('stock', '>', 0);

        if ($request->filled('category')) {
            $q->whereHas('category', fn ($c) => $c->where('slug', $request->category));
        }
        if ($request->filled('search')) {
            $q->where('name', 'like', '%'.$request->search.'%');
        }

        return $q->orderByDesc('featured')->orderBy('name')->get();
    }

    public function settings()
    {
        return config('shop');
    }
}
