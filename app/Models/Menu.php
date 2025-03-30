<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends BaseModelAuditableSoftDelete
{
    protected $fillable = [
        'title',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'title' => 'array', // array<LangKey, string>
        ]);
    }

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }
}
