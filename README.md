# FreshMart - Grocery E-commerce
Laravel 12 + React 18 + Tailwind CSS 4 + PostgreSQL (MySQL bhi chalega)

## Local
cp .env.example .env && composer install && php artisan key:generate
php artisan migrate --seed
npm install && npm run build && php artisan serve

## Deploy
Repo GitHub par push karein -> Render Blueprint (render.yaml) se deploy.
Orders `orders` + `order_items` tables mein save hote hain.
