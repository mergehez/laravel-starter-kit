<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends BaseModelAuditableSoftDelete
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        // 'content_tiptap',
        'tags',
        'status',
        'type',
        'image_url',
        'published_at',
        'views',
        'seo_id',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    public function seo(): BelongsTo
    {
        return $this->belongsTo(Seo::class);
    }

    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'title' => 'array',
            'excerpt' => 'array',
            'content' => 'array',
            // 'content_tiptap' => 'array', // array<LangKey, Json>
            'tags' => 'array',
            'data' => 'array', // array<string, any>
            'published_at' => 'int',
            'date_from' => 'int',
            'date_to' => 'int',
        ]);
    }
}
