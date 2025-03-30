<?php

namespace Database\Seeders;

use App\Enums\AppDisplayLang;
use App\Enums\KeyValueKey;
use App\Enums\MenuItemType;
use App\Enums\PostStatus;
use App\Enums\PostType;
use App\Enums\SpecialPage;
use App\Models\ErrorLog;
use App\Models\KeyValue;
use App\Models\Menu;
use App\Models\Post;
use App\Models\Seo;
use App\Models\Slider;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('pppp'),
            'remember_token' => Str::random(10),
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        $this->createPost('Home', 'Home', 'home', PostType::page);
        $this->createPost('About Us', 'About Us', 'about', PostType::page);
        $this->createPost('Contact', 'Contact', 'contact', PostType::page);
        $this->createPost('Test Post', 'Test Post', 'test-post', PostType::post);

        $homeSlider = $this->createDefaultSlider();
        $menu = $this->createDefaultMenu();

        $keyVals = [
            KeyValueKey::siteTitle => 'Arg Laravel',
            KeyValueKey::siteDesc => 'Arg Laravel is a very good website!',
            KeyValueKey::mainMenu => $menu->id, // Menu::first('id')->id,
            KeyValueKey::mobileMenu => $menu->id, // Menu::first('id')->id,
            KeyValueKey::homeSlider => $homeSlider->id, // Slider::first('id')->id,
            KeyValueKey::androidUrl => '',
            KeyValueKey::iosUrl => '',
            KeyValueKey::facebookAppId => '',
            KeyValueKey::facebookUrl => 'https://www.facebook.com/aaa',
            KeyValueKey::instagramUrl => 'https://www.instagram.com/aaa',
            KeyValueKey::twitterUrl => 'https://twitter.com/aaa',
            KeyValueKey::youtubeUrl => 'https://www.youtube.com/aaa',
            KeyValueKey::whatsappNumber => '', // e.g. +41 78 123 45 67,
            KeyValueKey::telegramNumber => '',
            KeyValueKey::contactEmail => 'aaa@gmail.com',
            KeyValueKey::notificationEmails => 'aaa@gmail.com,bbb@gmail.com',
        ];

        // User::factory(10)->create();

        foreach ($keyVals as $key => $value) {
            KeyValue::create([
                'key' => $key,
                'value' => $value,
            ]);
        }

        Errorlog::create([
            'route' => 'api.users.password.update',
            'url' => route('api.users.password.update', 1),
            'message' => 'Error message here',
            'count' => 1
        ]);
        Errorlog::create([
            'route' => 'api.key_values.update',
            'url' => route('api.key_values.update', 1),
            'message' => 'Couldn\'t update settings',
            'count' => 1
        ]);
    }

    private function createPost($title, $desc, $slug, string $type): void{
        $seo = Seo::create([
            'title' => $this->toJson($title),
            'description' => $this->toJson($desc),
            'keywords' => $this->toJson($title),
            'image_url' => 'https://images.unsplash.com/photo-1524591431555-cc7876d14adf?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'created_by' => 1,
            'updated_by' => 1,
        ]);
        $post = Post::create([
            'slug' => $slug,
            'title' => $this->toJson($title),
            'content' => $this->toJson($desc),
            'excerpt' => $this->toJson($desc),
            'tags' => $this->toJson([]),
            'image_url' => $seo->image_url,
            'seo_id' => $seo->id,
            'views' => 10,
            'type' => $type,
            'status' => PostStatus::published,
            'published_at' => time(),
            'created_by' => 1,
            'updated_by' => 1,
        ]);
    }

    private function createDefaultMenu(): Menu
    {
        $menu = Menu::create([
            'title' => 'Main',
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        $menu->items()->createMany([
            [
                'menu_id' => $menu->id,
                'title' => $this->toJson('Recent'),
                'type' => MenuItemType::special_page,
                'url' => '/news',
                'sequence' => 0,
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'menu_id' => $menu->id,
                'title' => $this->toJson('About Us'),
                'type' => MenuItemType::page,
                'post_id' => Post::where('slug', 'about')->first()->id,
                'sequence' => 1,
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'menu_id' => $menu->id,
                'title' => $this->toJson('Contact'),
                'type' => MenuItemType::post,
                'post_id' => Post::where('slug', 'contact')->first()->id,
                'sequence' => 3,
                'created_by' => 1,
                'updated_by' => 1,
            ],
        ]);

        $menu->save();

        return $menu;
    }

    public function createDefaultSlider(): Slider
    {
        $slider = Slider::create([
            'title' => $this->toJson('Home'),
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        $sliderItems = [
            [
                'image_url' => 'https://images.unsplash.com/photo-1524591431555-cc7876d14adf?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1518972458649-b0f242a400ff?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1531376653594-e9bcf0f0c65b?q=80&w=3031&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1605272916205-bb5945a0f49c?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            ],
        ];
        for ($i = 0; $i < count($sliderItems); $i++) {
            $sliderItems[$i]['sequence'] = $i;
            $sliderItems[$i]['title'] = $this->toJson('');
            $sliderItems[$i]['subtitle'] = $this->toJson('');
            $sliderItems[$i]['url'] = '';
            $sliderItems[$i]['text_color'] = '#ea580c';
            $sliderItems[$i]['bg_color'] = '#ffffff55';
            $sliderItems[$i]['created_by'] = 1;
            $sliderItems[$i]['updated_by'] = 1;
        }
        $slider->items()->createMany($sliderItems);

        return $slider;
    }

    private function toJson($val): array
    {
        $langCodes = AppDisplayLang::getValues();
        $json = [];
        foreach ($langCodes as $lang) {
            $json[$lang] = $val;
        }
        return $json;
    }
}
