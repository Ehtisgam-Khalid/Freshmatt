#!/bin/sh
set -e

# APP_KEY set na ho to generate kar lo
if [ -z "$APP_KEY" ]; then
  export APP_KEY=$(php artisan key:generate --show)
fi

php artisan package:discover --ansi
php artisan migrate --force      # tables Postgres mein ban jayenge
php artisan db:seed --force      # products (sirf pehli baar)
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
