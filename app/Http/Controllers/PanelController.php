<?php

namespace App\Http\Controllers;

use App\Enums\KeyValueKey;
use App\Models\ErrorLog;
use App\Models\KeyValue;
use App\Models\Menu;
use App\Models\Post;
use App\Models\Slider;
use DB;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PanelController extends Controller
{
    public function home(Request $request)
    {
        return Inertia::render('Panel/PanelHome', [
            'pageData' => [
                'keyValues' => KeyValue::all(['key', 'value'])
                    ->mapWithKeys(fn($item) => [$item['key'] => $item['value']]),
                'sliders' => Slider::all(['id', 'title'])
                    ->map(fn($item) => [
                        "value" => $item['id'],
                        "label" => $item['title'],
                    ]),
                'menus' => Menu::all(['id', 'title'])
                    ->map(fn($item) => [
                        "value" => $item['id'],
                        "label" => $item['title'],
                    ]),
            ]
        ]);
    }

    public function errors(Request $request)
    {
        return Inertia::render('Panel/PanelErrors', [
            'pageData' => [
                'errors' => ErrorLog::query()
                    ->orderByDesc('created_at')
                    ->paginateWithQuery(1024)
            ]
        ]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            KeyValueKey::siteTitle => ['required', 'string', 'max:60'],
            KeyValueKey::siteDesc => ['required', 'string', 'max:160'],
            KeyValueKey::mainMenu => ['nullable', 'integer'],  //, 'exists:menus,id'],
            KeyValueKey::mobileMenu => ['nullable', 'integer'],//, 'exists:menus,id'],
            KeyValueKey::homeSlider => ['required', 'integer', 'exists:sliders,id'],
            KeyValueKey::androidUrl => ['nullable', 'string'],
            KeyValueKey::iosUrl => ['nullable', 'string'],
            KeyValueKey::facebookAppId => ['nullable', 'string'],
            KeyValueKey::facebookUrl => ['nullable', 'active_url'],
            KeyValueKey::instagramUrl => ['nullable', 'active_url'],
            KeyValueKey::twitterUrl => ['nullable', 'active_url'],
            KeyValueKey::youtubeUrl => ['nullable', 'active_url'],
            KeyValueKey::whatsappNumber => ['nullable', 'string'],
            KeyValueKey::telegramNumber => ['nullable', 'string'],
            KeyValueKey::contactEmail => ['nullable', 'email'],
            KeyValueKey::notificationEmails => ['nullable', 'string'],
        ]);
        $data = array_map(fn($t) => $t ?? '', $data);

        DB::transaction(function () use ($data) {
            foreach ($data as $key => $value) {
                KeyValue::where('key', $key)
                    ->update(['value' => $value]);
            }
        });

        cache()->clear();

        return $data;
    }

    public static function updateSitemap(Request $request)
    {
        $data = $request->validate(['prefix' => ['required', 'string', Rule::in('h', 'g')],]);
        $prefix = $data['prefix'];
        $today = date('Y-m-d');

        $sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
        $sitemap .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        $allLinks = collect();
        $add = function ($url, $lastmod, $priority, $image = null) use ($allLinks, &$sitemap, $prefix) {
            $allLinks->push($url);

            if ($lastmod instanceof Carbon) {
                $lastmod = $lastmod->format('Y-m-d');
            }

            $image ??= "/images/{$prefix}logo/logo-256.png";

            if ($image && !Str::startsWith($image, 'http')) {
                $image = url($image);
            }

            if ($url && !Str::startsWith($url, 'http')) {
                $url = url($url);
            }

            $image = "<image:image><image:loc>$image</image:loc></image:image>";
            $sitemap .= "<url><loc>$url</loc><lastmod>$lastmod</lastmod><priority>$priority</priority>$image</url>";
        };

        $menus = [
            route('page.posts'),
            route('page.random-items'),
            route('page.send-item'),
            route('page.advanced-search'),
            route('page.about'),
            route('page.popular-items'),
            route('page.recent-items'),
            route('page.artists'),
            route('page.posts'),
        ];
        foreach ($menus as $t) {
            $add(
                $t,
                $today,
                1.00,
            );
        }

        $alphabet = ['A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'];
        foreach ($alphabet as $letter) {
            $add(
                route('page.alphabet', $letter),
                $today,
                0.85,
            );
        }

        $allPosts = Post::all('slug', 'image_url', 'updated_at');
        foreach ($allPosts as $x) {
            $add(
                route('page.post', $x->slug),
                $x->updated_at,
                0.80,
                $x->image_url
            );
        }

        // $listes = Liste::all('slug', 'image_url', 'updated_at');
        // foreach ($listes as $x) {
        //     $add(
        //         route('page.list', $x->slug),
        //         $x->updated_at,
        //         0.80,
        //         $x->image_url
        //     );
        // }

        //
        // $artists = Artist::all('slug', 'image_url', 'updated_at');
        // foreach ($artists as $x) {
        //     $add(
        //         route('page.artist', $x->slug),
        //         $x->updated_at,
        //         0.80,
        //         public_path("/images/{$prefix}logo/$x->image_url")
        //     );
        // }
        // $items = Item::withArtists()->get();
        // foreach ($items as $x) {
        //     $img = $x->artists->count() == 0 || $x->artists->count() > 1 ? null : "/images/{$prefix}artists/{$x->artists->first()->image_url}";
        //     $add(
        //         route('page.item', $x->slug),
        //         $x->updated_at,
        //         0.80,
        //         $img
        //     );
        // }
        $sitemap .= '</urlset>';

        Storage::disk('public-folder')->put("sitemap.xml", $sitemap);


        try {
            $client = new Client;
            $chunkedUrls = $allLinks->chunk(10000);
            foreach ($chunkedUrls as $urls) {
                $client->request('POST', 'https://www.bing.com/indexnow', [
                    'json' => [
                        'host' => $request->uri()->host(),
                        'key' => 'e0df0f5e5e70405093005dda5e400752',
                        'keyLocation' => 'https://'.$request->uri()->host().'/e0df0f5e5e70405093005dda5e400752.txt',
                        'urlList' => $urls->values()->toArray(),
                    ],
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                ]);
            }
        } catch (ClientException $e) {
            if (str_ends_with($request->uri()->host(), '.test')) {
                dump("<br><br>Guzzle\ClientException<br/>");
                dd('<br>'.$e->getResponse()->getBody());
            }
        } catch (GuzzleException $e) {
            if (str_ends_with($request->uri()->host(), '.test')) {
                dd($e);
            }
        }

        $time = time();
        KeyValue::where('key', 'sitemapLastUpdate')
            ->update(['value' => $time]);

        return $time;
    }

}
