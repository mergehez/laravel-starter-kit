<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Slider extends BaseModelAuditableSoftDelete
{
    protected $fillable = [
        'title',
        'created_at',
        'updated_at',
        'created_by',
        'updated_by',
        'deleted_at',
        'deleted_by',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(SliderItem::class);
    }

    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'title' => 'array', // array<LangKey, string>
        ]);
    }
}
