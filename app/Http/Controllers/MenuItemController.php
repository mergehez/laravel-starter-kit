<?php

namespace App\Http\Controllers;

use App\Enums\MenuItemType;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuItemController extends Controller
{
    private function getSharedRules(){
        return [
            'type' => [Rule::in(MenuItemType::getValues())],
            'title' => ['required', 'array'],
            'title.*' => ['required', 'string', 'max:255'],
            'url' => ['nullable','string'],
            'post_id' => ['nullable','integer', 'exists:posts,id'],
        ];
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            ...$this->getSharedRules(),
            'menu_id' => ['required','integer','exists:menus,id'],
        ]);

        $maxSequence = MenuItem::query()
            ->where('menu_id', $data['menu_id'])
            ->max('sequence') ?? 0;

        $data['sequence'] = $maxSequence + 1;

        return MenuItem::create($data);
    }

    public function update(Request $request, int $id)
    {
        $item = MenuItem::findOrFail($id);
        $data = $request->validate($this->getSharedRules());
        // $data = array_map(fn($t) => $t ?? '', $data);

        $item->update($data);

        return $item;
    }

    public function destroy($id)
    {
        $item = MenuItem::findOrFail($id);
        $item->delete();
        return $item;
    }
}
