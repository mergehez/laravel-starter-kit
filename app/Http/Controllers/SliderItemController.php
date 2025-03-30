<?php

namespace App\Http\Controllers;

use App\Models\SliderItem;
use Illuminate\Http\Request;

class SliderItemController extends Controller
{
    private function getSharedRules()
    {
        return [
            'title' => ['required', 'array'],
            'title.*' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['required', 'array'],
            'subtitle.*' => ['nullable', 'string', 'max:255'],
            'url' => ['nullable', 'string'],
            'image_url' => ['required', 'string'],
            'text_color' => ['required', 'string'],
            'bg_color' => ['required', 'string'],
            'slider_id' => ['nullable', 'integer', 'exists:sliders,id'],
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            ...$this->getSharedRules(),
            'slider_id' => ['nullable', 'integer', 'exists:sliders,id'],
        ]);
        $data = array_map(fn($t) => $t ?? '', $data);

        $maxSequence = SliderItem::query()
            ->where('slider_id', $data['slider_id'])
            ->max('sequence') ?? 0;

        $data['sequence'] = $maxSequence + 1;

        return SliderItem::create($data);
    }

    public function update(Request $request, int $id)
    {
        $item = SliderItem::findOrFail($id);
        $data = $request->validate($this->getSharedRules());
        $data = array_map(fn($t) => $t ?? '', $data);

        $item->update($data);

        cache()->clear();

        return $item;
    }

    public function destroy($id)
    {
        $item = SliderItem::findOrFail($id);
        $item->delete();

        cache()->clear();

        return $item;
    }
}
