<?php

namespace App\Http\Middleware;

use App\ArgState;
use App\Enums\AppDisplayLang;
use App\Enums\KeyValueKey;
use App\Enums\PostType;
use App\Models\KeyValue;
use App\Models\Menu;
use App\Models\Post;
use App\Models\Slider;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected array $supportedLanguages;

    public function __construct(AppDisplayLang $displayLangEnum)
    {
        $this->supportedLanguages = $displayLangEnum::getValues();
    }

    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $isPanel = $request->routeIs('panel.*');

        $auth = ArgState::authNullable();
        $sessionLifetime = intval(config('session.lifetime'));


        $navStats = [];
        if ($auth && $isPanel) {
            // $chatController = new ChatController();
            // $chats = $chatController->getChatList($auth->id);
            $navStats = [
                'sliders' => Slider::count(),
                'keyValues' => KeyValue::count(),
                'posts' => Post::where('type', PostType::post)->count(),
                'pages' => Post::where('type', PostType::page)->count(),
            ];
        }

        return array_merge(parent::share($request), [
            'php_version' => phpversion(),
            'csrf_token' => csrf_token(),
            'auth' => [
                'user' => $auth,
                'session_lifetime' => $sessionLifetime,
                'session_expire' => fn () => $auth ? time() + $sessionLifetime * 60 : null,
                // 'activeUsers' => $auth ? State::getActiveUsers()->unique('user_id') : [],
            ],
            'localization' => function () {
                if (! session()->has('locale')) {
                    session()->put('locale', app()->getLocale());
                }

                return [
                    'locale' => session()->get('locale'),
                    'locales' => $this->supportedLanguages,
                    'current_time' => time(),
                ];
            },
            'info' => cache()->remember('nav-stats', 60 * 60, function () {
                $keyVals = KeyValue::all();
                $info = [];
                foreach ($keyVals as $keyVal) {
                    $info[$keyVal->key] = $keyVal->value;
                }
                return $info;
            }),
            'menu' => function() {
                $menuId = KeyValue::where('key', KeyValueKey::mainMenu)->first()->value;
                $menu = Menu::with(['items' => fn($q) => $q->orderBy('sequence')])
                    ->where('id', $menuId)
                    ->first();
                $menu->items->each(function($item){
                    $item->url ??= route('page.post', ['slug' => $item->post->slug]);
                });

                return $menu;
            },
            'navStats' => $navStats,
            'app_version' => 'ArgPanel v1.0.0',
        ]);
    }
}
