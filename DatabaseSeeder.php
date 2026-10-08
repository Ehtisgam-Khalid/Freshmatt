<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Sirf pehli baar seed hoga
        if (Product::count() > 0) {
            return;
        }

        $catalog = [
            ['Fruits', '🍎', [
                ['Apple (Kala Kulu)', 320, '1 kg', '🍎', true],
                ['Banana', 180, '1 dozen', '🍌', true],
                ['Orange (Malta)', 250, '1 kg', '🍊', false],
                ['Mango (Chaunsa)', 420, '1 kg', '🥭', true],
                ['Grapes', 380, '1 kg', '🍇', false],
            ]],
            ['Vegetables', '🥦', [
                ['Tomato', 120, '1 kg', '🍅', true],
                ['Potato', 90, '1 kg', '🥔', false],
                ['Onion', 110, '1 kg', '🧅', false],
                ['Carrot', 100, '1 kg', '🥕', false],
                ['Cucumber', 80, '1 kg', '🥒', false],
            ]],
            ['Dairy & Eggs', '🥛', [
                ['Fresh Milk', 220, '1 litre', '🥛', true],
                ['Farm Eggs', 360, '1 dozen', '🥚', true],
                ['Butter', 450, '200 g', '🧈', false],
                ['Cheese Slices', 520, '200 g', '🧀', false],
                ['Yogurt (Dahi)', 240, '1 kg', '🥣', false],
            ]],
            ['Bakery', '🍞', [
                ['Fresh Bread', 140, '1 loaf', '🍞', true],
                ['Croissant', 90, '1 pc', '🥐', false],
                ['Chocolate Cake', 1200, '1 lb', '🍰', false],
            ]],
            ['Meat & Fish', '🍗', [
                ['Chicken (Boneless)', 780, '1 kg', '🍗', true],
                ['Beef', 1400, '1 kg', '🥩', false],
                ['Fresh Fish (Rahu)', 650, '1 kg', '🐟', false],
            ]],
            ['Pantry', '🍚', [
                ['Basmati Rice', 380, '1 kg', '🍚', true],
                ['Atta (Wheat Flour)', 1900, '10 kg', '🌾', false],
                ['Cooking Oil', 520, '1 litre', '🛢️', false],
                ['Sugar', 150, '1 kg', '🍬', false],
                ['Tea (Tapal Danedar)', 590, '430 g', '🍵', true],
            ]],
            ['Beverages', '🧃', [
                ['Orange Juice', 280, '1 litre', '🧃', false],
                ['Mineral Water', 120, '1.5 litre', '💧', false],
                ['Cold Drink', 160, '1.5 litre', '🥤', false],
            ]],
        ];

        foreach ($catalog as [$name, $emoji, $products]) {
            $cat = Category::create(['name' => $name, 'slug' => Str::slug($name), 'emoji' => $emoji]);
            foreach ($products as [$pname, $price, $unit, $pemoji, $featured]) {
                Product::create([
                    'category_id' => $cat->id,
                    'name' => $pname,
                    'slug' => Str::slug($pname),
                    'description' => "Fresh {$pname} - seedha aapke ghar tak.",
                    'price' => $price,
                    'unit' => $unit,
                    'emoji' => $pemoji,
                    'stock' => 200,
                    'featured' => $featured,
                ]);
            }
        }
    }
}
