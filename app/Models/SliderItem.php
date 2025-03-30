<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SliderItem extends BaseModelAuditable
{
    protected $fillable = [
        'slider_id',
        'title',
        'subtitle',
        'image_url',
        'url',
        'text_color',
        'bg_color',
        'sequence',
        'is_active',
        'created_at',
        'updated_at',
        'created_by',
        'updated_by',
    ];

    public function slider(): BelongsTo
    {
        return $this->belongsTo(Slider::class);
    }

    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'title' => 'array', // array<LangKey, string>
            'subtitle' => 'array', // array<LangKey, string>
        ]);
    }
}
