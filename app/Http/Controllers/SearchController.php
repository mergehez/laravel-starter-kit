<?php

namespace App\Http\Controllers;

use App\Enums\PostStatus;
use App\Enums\SpecialPage;
use App\Models\Post;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q = Str::lower($request->get('query'));
        if (empty($q)) {
            return [];
        }

        $all = collect();

        foreach (SpecialPage::getAll() as $key => $value) {
            $qSlug = Str::slug($q, ' ');
            if(str_contains(Str::slug($key, ' '), $qSlug) || str_contains(Str::slug($value, ' '), $qSlug)) {
                $all->push([
                    'id' => 0,
                    'title' => $key,
                    'slug' => $value,
                    'type' => 'special',
                    'tr' => true,
                ]);
            }
        }
        $loc = App::currentLocale();

        /** @noinspection SqlNoDataSourceInspection, SqlResolve */
        $posts = Post::fromQuery(
            <<<SQL
            SELECT `id`, `title`, `slug`, `type`
            FROM `posts`
            WHERE JSON_UNQUOTE(JSON_EXTRACT(title, '$.$loc')) COLLATE utf8mb4_general_ci LIKE ?
              AND `status` = 'publish'
              AND `posts`.`deleted_at` IS NULL
            ORDER BY JSON_UNQUOTE(JSON_EXTRACT(`title`, '$.$loc')) COLLATE utf8mb4_general_ci DESC
            LIMIT 10;
            SQL
        , ["%$q%"]);

        $all = $all->merge($posts);

        return $all->take(10)->toArray();
    }

    public function index(Request $request)
    {
        $q = Str::lower($request->get('q', ''));

        $items = [];
        if ($q) {
            $items = Post::query()
                ->where('title', 'like', "%$q%")
                ->where('status', PostStatus::published)
                ->orderByDesc('title')
                ->paginateWithQuery(48);
        }

        return Inertia::render('Frontend/PageSearch', [
            'pageData' => [
                'query' => $request->get('q', ''),
                'items' => $items
            ]
        ]);
    }
    public function indexAdvanced(Request $request)
    {
        $q = Str::lower($request->get('q', ''));

        $items = [];
        if ($q) {
            $items = Post::query()
                ->where('title', 'like', "%$q%")
                ->orWhere('content', 'like', "%$q%")
                ->where('status', PostStatus::published)
                ->orderByDesc('title')
                ->paginateWithQuery(48);
        }

        return Inertia::render('Frontend/PageAdvancedSearch', [
            'pageData' => [
                'query' => $request->get('q', ''),
                'items' => $items
            ]
        ]);
    }

    // public function pageAdvancedSearch(Request $request)
    // {
    //     $query = $request->get('query', '');
    //     $color = $request->get('color', '#ff0000');
    //     $limit = 48;
    //
    //     $q = $request->get('query', '');
    //     if ($q) {
    //         $q = Str::replace(['&', '-'], ' ', $q);
    //         // replace multiple spaces with a single space
    //         $q = preg_replace('/\s+/', ' ', $q);
    //         $q = strtolower(trim($q));
    //     }
    //     if (strlen($q) > 2) {
    //         $sql = Item::query()
    //             ->with('artists:id,name,slug,image_url')
    //             ->where('latin', 'like', "%$q%")
    //             ->orWhere('content', 'like', "%$q%");
    //         $total = $sql->count();
    //         $items = $sql->limit($limit)
    //             ->get(Item::boxCols);
    //     } else {
    //         $total = 0;
    //         $items = [];
    //     }
    //     return Inertia::render('Frontend/PageAdvancedSearch', [
    //         'pageData' => [
    //             'query' => $query,
    //             'q' => $q,
    //             'color' => $color,
    //             'items' => $items,
    //             'total' => $total,
    //             'limit' => $limit,
    //         ]
    //     ]);
    // }
}
