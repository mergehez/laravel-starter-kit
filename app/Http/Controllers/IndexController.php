<?php

namespace App\Http\Controllers;

use App\Enums\KeyValueKey;
use App\Models\KeyValue;
use App\Models\Post;
use App\Models\Slider;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Str;

class IndexController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->get('s', '');
        // $q = Post::query()
        //     ->where('status', PostStatus::published)
        //     ->where('type', PostType::post)
        //     ->orderByDesc('published_at');
        //
        // if($query){
        //     $posts = $q->where('title', 'like', "%$query%")->limit(10)->get();
        //
        //     if($posts->count() < 10){
        //         $posts = $q->where('content', 'like', "%$query%")->limit(10 - $posts->count())->get();
        //     }
        // }else{
        //     $posts = $q->limit(10)->get();
        // }

        // $posts->each(fn($p) => $p->styleForListing());

        $slider = cache()->remember('home-slider', 60 * 60 * 24, function () {
            $homeSliderId = KeyValue::where('key', KeyValueKey::homeSlider)->first()->value;
            return Slider::query()
                ->where('id', $homeSliderId)
                ->with(['items' => fn($q) => $q->orderBy('sequence')])
                ->first();
        });

        return Inertia::render('Frontend/PageIndex', [
            'pageData' => [
                'slider' => $slider,
            ]
        ]);
    }

}
