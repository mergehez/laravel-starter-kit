<?php /** @noinspection SpellCheckingInspection */

use App\ArgRoute;
use App\Enums\SpecialPage;
use App\Http\Controllers\ArgMediaLibraryController;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\PanelController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SliderController;
use App\Http\Controllers\SliderItemController;
use App\Http\Controllers\UserController;
use App\Models\MenuItem;
use App\Models\SliderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

Route::get('locale/{locale}', function ($locale, Request $request) {
    session()->put('locale', $locale);
    if($request->has('same_url')) {
        return redirect()->back();
    }
    $url = LaravelLocalization::getLocalizedURL($locale, $request->header('referer') ?? '/');
    return redirect($url);
})->name('change-locale');

Route::group(['prefix' => LaravelLocalization::setLocale()], function () {
    Route::group(['as' => 'page.'], function () {
        Route::inertia('/login', 'Auth/PageLogin')->name('login');
        Route::get(SpecialPage::home_page, [IndexController::class, 'index'])->name('home');
        Route::get(SpecialPage::posts, [PostController::class, 'index'])->name('posts');
        Route::get(SpecialPage::advanced_search, [SearchController::class, 'indexAdvanced'])->name('advancedSearch');
        Route::get(SpecialPage::about_us, fn() => new PostController()->show(SpecialPage::about_us))->name('about');
        Route::get('/search', [SearchController::class, 'index'])->name('search');

        Route::get(SpecialPage::posts.'/{slug}', [PostController::class, 'show'])
            ->where('slug', '[A-z0-9-]+')
            ->name('post');

        Route::inertia('/privacy-policy.html', 'Frontend/PagePrivacyPolicy')->name('privacy-policy');
        Route::inertia('/privacy-policy', 'Frontend/PagePrivacyPolicy')->name('privacy-policy');
    });
});

Route::group(['as' => 'api.', 'prefix' => 'api/'], function () {
    ArgRoute::apiAuth();

    Route::get('/search', [SearchController::class, 'search'])->name('search');
    Route::put('/key_values/{id}', [PanelController::class, 'updateSettings'])->name('key_values.update');

    ArgRoute::apiGroup('users', UserController::class);
    ArgRoute::apiGroup('posts', PostController::class);
    ArgRoute::apiGroup('sliders', SliderController::class);
    ArgRoute::apiGroup('slider_items', SliderItemController::class, SliderItem::class);
    ArgRoute::apiGroup('menus', MenuController::class);
    ArgRoute::apiGroup('menu_items', MenuItemController::class, MenuItem::class);

    Route::put('users/{id}/change-password', [UserController::class, 'changePassword'])->name('users.password.update');
    Route::post('panel/sitemap-update', [PanelController::class, 'updateSitemap'])->name('panel.sitemap-update');
});

Route::group(['as' => 'panel.', 'prefix' => 'panel/', 'middleware' => ['auth:web']], function () {
    Route::get('/', [PanelController::class, 'home'])->name('home');
    Route::get('/errors', [PanelController::class, 'errors'])->name('errors');
    // Route::get('/home', [PanelController::class, 'home'])->name('home');
    Route::get('/users', [UserController::class, 'panelIndex'])->name('users');
    Route::get('/profile', [UserController::class, 'panelIndexProfile'])->name('profile');
    Route::get('/pages', [PostController::class, 'panelIndexPages'])->name('pages');
    Route::get('/posts', [PostController::class, 'panelIndex'])->name('posts');
    Route::get('/pages/create', [PostController::class, 'panelCreatePage'])->name('pages.create');
    Route::get('/posts/create', [PostController::class, 'panelCreatePost'])->name('posts.create');
    Route::get('/post/{id}', [PostController::class, 'panelEdit'])->name('post');
    Route::get('/about-page', [PanelController::class, 'home'])->name('about-page');
    Route::get('/info', [PanelController::class, 'home'])->name('info');
    Route::get('/sliders', [SliderController::class, 'panelIndex'])->name('sliders');
    Route::get('/sliders/create', [SliderController::class, 'panelCreate'])->name('sliders.create');
    Route::get('/slider/{id}', [SliderController::class, 'panelEdit'])->name('sliders.edit');
    Route::get('/menus', [MenuController::class, 'panelIndex'])->name('menus');
    Route::get('/menus/create', [MenuController::class, 'panelCreate'])->name('menus.create');
    Route::get('/menu/{id}', [MenuController::class, 'panelEdit'])->name('menus.edit');
    Route::inertia('/media-library', 'Panel/PanelMediaLibrary')->name('media-library');
    Route::inertia('/components', 'Panel/Components')->name('components');
});

ArgMediaLibraryController::registerRoutes([]);