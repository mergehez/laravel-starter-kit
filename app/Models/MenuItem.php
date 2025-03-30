<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItem extends BaseModelAuditable
{
    protected $fillable = [
        'menu_id',
        'type',
        'title',
        'url',
        'post_id',
        'sequence',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'title' => 'array', // array<LangKey, string>
        ]);
    }
    public function slider(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function newQuery(){
        return parent::newQuery()->with('post:id,title,slug');
    }
}
