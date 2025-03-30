<?php

namespace App\Http\Middleware;

use Closure;

class ArgSetLocale
{
    public function handle($request, Closure $next): mixed
    {
        app()->setLocale(config('app.locale'));
        if (session()->has('locale')) {
            app()->setLocale(session('locale'));
        }

        return $next($request);
    }
}
