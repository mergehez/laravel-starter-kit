<?php

namespace App;


use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

class ArgRoute
{
    public static function apiGroup($uri, $controller, $sequencedModel = null): void
    {
        Route::group(['as' => "$uri.", 'prefix' => "$uri/"], function () use ($controller, $sequencedModel) {
            Route::post('/', [$controller, 'store'])->name('store');
            Route::put('/{id}', [$controller, 'update'])->name('update');
            Route::delete('/{id}', [$controller, 'destroy'])->name('destroy');

            if($sequencedModel)
                self::sequenceSwap($sequencedModel);
        });
    }

    public static function apiAuth(): void
    {
        Route::post('/login', [UserController::class, 'login'])->name('login');
        Route::get('/logout', [UserController::class, 'logout'])->name('logout');
    }

    public static function storeUpdateDelete($controller): void
    {
        Route::post('/', [$controller, 'store'])->name('store');
        Route::put('/{id}', [$controller, 'update'])->name('update');
        Route::delete('/{id}', [$controller, 'destroy'])->name('destroy');
    }

    public static function sequenceSwap($model): void
    {
        Route::put('/{id1}/swap-sequence/{id2}', function ($id1, $id2) use ($model) {
            $first = $model::findOrFail($id1);
            $second = $model::findOrFail($id2);

            $tmp = $first->sequence;
            $first->sequence = $second->sequence;
            $second->sequence = $tmp;

            $first->save();
            $second->save();

            return [$first, $second];
        })->name('swap-sequence');
    }
}