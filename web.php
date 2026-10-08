<?php

use Illuminate\Support\Facades\Route;

// React single page app - har route yahin aata hai
Route::view('/{any?}', 'app')->where('any', '^(?!api|up).*$');
