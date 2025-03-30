<?php

namespace App\Http\Controllers;

use App\Enums\PostStatus;
use App\Enums\PostType;
use App\Models\Post;
use App\Models\Seo;
use DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Session;
use Str;

class PostController extends Controller
{
    public function panelIndex()
    {
        $posts = Post::orderByDesc('updated_at')->where('type', PostType::post)->get();
        return Inertia::render('Panel/PanelPosts', [
            'pageData' => [
                'posts' => $posts,
            ],
        ]);
    }

    public function panelIndexPages()
    {
        $posts = Post::orderByDesc('updated_at')->where('type', PostType::page)->get();
        return Inertia::render('Panel/PanelPages', [
            'pageData' => [
                'posts' => $posts,
            ],
        ]);
    }

    public function panelEdit($id)
    {
        return Inertia::render('Panel/PanelPost', [
            'pageData' => [
                'post' => Post::with('seo')->findOrFail($id)
            ],
        ]);
    }

    public function panelCreatePost()
    {
        return Inertia::render('Panel/PanelPost', [
            'pageData' => [
                'post' => Post::make([
                    'status' => PostStatus::draft,
                    'type' => PostType::post
                ])
            ],
        ]);
    }
    public function panelCreatePage()
    {
        return Inertia::render('Panel/PanelPost', [
            'pageData' => [
                'post' => Post::make([
                    'status' => PostStatus::draft,
                    'type' => PostType::page
                ])
            ],
        ]);
    }

    public function index()
    {
        $posts = Post::query()
            ->where('status', PostStatus::published)
            ->where('type', PostType::post)
            ->orderByDesc('published_at')
            ->paginate(10);

        // $posts->each(fn($p) => $p->styleForListing()); // TODO

        return Inertia::render('Frontend/PagePosts', [
            'pageData' => [
                'posts' => $posts,
            ],
        ]);
    }

    public function show($slug)
    {
        $post = Post::query()
            ->with('seo')
            ->where('slug', $slug)
            ->firstOrFail();

        $post->contentOriginal = $post->content;
        // $post->styleForDisplay(); // TODO
        // if(!str_contains($post->content, 'class="wp-')){
        //     try {
        //         $post->content = (new CommonMarkConverter([
        //             'renderer' => [
        //                 'block_separator' => "\n",
        //                 'inner_separator' => "\n",
        //                 'soft_break'      => "\n",
        //             ],
        //             'html_input' => 'allow',
        //         ]))->convert($post->content)->getContent();
        //     }catch (Throwable){}
        // }
        $viewed = Session::get('viewed_posts', []);
        if (!in_array($post->id, $viewed)) {
            $viewed[] = $post->id;
            Session::put('viewed_posts', $viewed);
            Post::withoutTimestamps(fn() => $post->increment('views'));
        }

        return Inertia::render('Frontend/PagePost', [
            'pageData' => [
                'post' => $post
            ],
        ]);
    }

    public function validateSeo(Request $request): array
    {
        return $request->validate([
            'seo' => ['required', 'array'],
            'seo.title' => ['required', 'array'],
            'seo.title.*' => ['nullable', 'string', 'max:255'],
            'seo.description' => ['required', 'array'],
            'seo.description.*' => ['nullable', 'string', 'max:255'],
            'seo.keywords' => ['required', 'array'],
            'seo.keywords.*' => ['nullable', 'string', 'max:255'],
            'seo.image_url' => ['nullable', 'string'],
        ]);
    }

    private function getSharedRules(): array
    {
        return [
            'title' => ['required', 'array'],
            'title.*' => ['required', 'string', 'max:255'],
            'content' => ['required', 'array'],
            'content.*' => ['required', 'string'],
            'excerpt' => ['required', 'array'],
            'excerpt.*' => ['required', 'string', 'max:1024'],
            'tags' => ['required', 'array'],
            'tags.*' => ['sometimes', 'array'],
            // 'content_tiptap' => ['required', 'array'],
            'type' => ['required', Rule::in(PostType::getValues())],
            'status' => ['required', Rule::in(PostStatus::getValues())],
            'image_url' => [
                'sometimes', 'nullable', function ($attribute, $value, $fail) {
                    if (!str_contains($value, '.') || (!str_starts_with($value, '/') && !Str::isUrl($value))) {
                        $fail('Invalid image url');
                    }
                }
            ],
        ];
    }

    public function store(Request $request, bool $fromSeeder = false)
    {
        $data = $request->validate([
            ...$this->getSharedRules(),
            ...(!$fromSeeder ? [] : [
                'id' => ['required', 'integer'],
                'slug' => ['required', Rule::unique('posts')],
                'published_at' => ['sometimes', 'nullable', 'string'],
                'created_at' => ['required', 'string'],
                'updated_at' => ['required', 'string'],
                ''
            ]),
        ]);

        $dataSeo = $this->validateSeo($request);

        if ($data['status'] === PostStatus::published) {
            if ($fromSeeder) {
                $data['published_at'] = $data['created_at'];
            } else {
                $data['published_at'] = now();
            }
        }

        if (!array_key_exists('slug', $data) || !$data['slug']) {
            $suffix = '';
            while (Post::where('slug', $slug = Str::slug($data['title'].$suffix))->exists()) {
                $suffix = $suffix === '' ? 2 : $suffix + 1;
            }
            $data['slug'] = $slug;
        }

        return DB::transaction(function () use ($data, $dataSeo) {
            $seo = Seo::create($dataSeo['seo']);
            $data['seo_id'] = $seo->id;

            cache()->clear();

            return Post::create($data);
        });
    }

    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        $data = $request->validate([
            ...$this->getSharedRules(),
            'slug' => ['sometimes', Rule::unique('posts')->ignore($request->id)],
        ]);

        $dataSeo = $this->validateSeo($request);

        if (!$data['slug']) {
            $suffix = '';
            while (Post::where('slug', $slug = Str::slug($data['title'].$suffix))->exists()) {
                $suffix = $suffix === '' ? 2 : $suffix + 1;
            }
            $data['slug'] = $slug;
        }

        if (!$post->published_at && $data['status'] === PostStatus::published) {
            $data['published_at'] = time();
        }

        // $post->updateTimestamps();

        return DB::transaction(function () use ($post, $data, $dataSeo) {
            $post->update($data);
            $post->seo()->update($dataSeo['seo']);

            cache()->clear();

            return $post;
        });
    }

    public function destroy(int $id)
    {
        $post = Post::findOrFail($id);

        cache()->clear();

        return $post->delete();
    }
}
