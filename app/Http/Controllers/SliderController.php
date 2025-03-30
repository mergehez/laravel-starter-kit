<?php

namespace App\Http\Controllers;

use App\Models\Slider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SliderController extends Controller
{
    public function panelIndex()
    {
        $items = Slider::orderByDesc('updated_at')->get();
        return Inertia::render('Panel/PanelSliders', [
            'pageData' => [
                'items' => $items
            ]
        ]);
    }

    public function panelEdit($id)
    {
        return Inertia::render('Panel/PanelSlider', [
            'pageData' => [
                'item' => $id === -1 ? [
                    'title' => '',
                    'items' => []
                ] : Slider::with([
                    'items' => fn($q) => $q->orderBy('sequence')
                ])->findOrFail($id),
            ]
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

        cache()->clear();

        return Slider::create($data);
    }

    public function update(Request $request, int $id)
    {
        $item = Slider::findOrFail($id);
        $data = $request->validate([
            'title' => ['required', 'array'],
            'title.*' => ['sometimes', 'string', 'max:255'],
        ]);

        $item->update($data);

        cache()->clear();

        return $item;
    }

    public function destroy($id)
    {
    }
}
