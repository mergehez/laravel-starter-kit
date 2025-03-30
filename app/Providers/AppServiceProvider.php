<?php

namespace App\Providers;

use App\Enums\KeyValueKey;
use App\Models\KeyValue;
use Date;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        Model::shouldBeStrict();
        DB::prohibitDestructiveCommands(config('app.env') === 'production');
        RequestException::dontTruncate();

        View::composer('app', function ($view) {
            $theme = (array_key_exists('COLOR-THEME', $_COOKIE) && $_COOKIE['COLOR-THEME'] === 'dark') ? 'dark' : '';
            $info = KeyValue::whereIn('key', [KeyValueKey::siteTitle, KeyValueKey::siteDesc])->get()->mapWithKeys(fn($item) => [$item->key => $item->value]);
            return $view
                ->with('websiteInfo', $info)
                ->with('theme', $theme);
        });

        RateLimiter::for('login', function (Request $request) {
            /** @var string $email */
            $email = $request->get('email');
            $throttleKey = Str::transliterate(Str::lower($email).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
