<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function panelIndex()
    {
        $items = Menu::orderByDesc('updated_at')->get();
        return Inertia::render('Panel/PanelMenus', [
            'pageData' => [
                'items' => $items
            ]
        ]);
    }

    public function panelEdit($id)
    {
        return Inertia::render('Panel/PanelMenu', [
            'pageData' => [
                'item' => $id === -1 ? [
                    'title' => '',
                    'items' => []
                ] : Menu::with([
                    'items' => fn($q) => $q->orderBy('sequence')
                ])->findOrFail($id),
                'pages' => Post::where('type', 'page')->get()
                    ->map(fn($item) => [
                        "value" => $item['id'],
                        "label" => $item['title'],
                    ]),
                'posts' => Post::where('type', 'post')->get()
                    ->map(fn($item) => [
                        "value" => $item['id'],
                        "label" => $item['title'],
                    ]),
            ],
        ]);
    }

    public function panelCreate()
    {
        return $this->panelEdit(-1);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'array'],
            'title.*' => ['required', 'string', 'max:255'],
        ]);

        return Menu::create($data);
    }

    public function update(Request $request, int $id)
    {
        $item = Menu::findOrFail($id);
        $data = $request->validate([
            'title' => ['required', 'array'],
            'title.*' => ['required', 'string', 'max:255'],
        ]);

        $item->update($data);

        return $item;
    }
}
