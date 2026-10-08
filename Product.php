<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['category_id', 'name', 'slug', 'description', 'price', 'unit', 'emoji', 'stock', 'featured'];

    protected $casts = ['price' => 'float', 'featured' => 'boolean'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
