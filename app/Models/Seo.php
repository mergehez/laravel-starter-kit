<?php

namespace App\Models;

/**
 * @property string $title
 * @property string $description
 * @property string $keywords
 * @property string $image_url
 * @property string $url
 */
class Seo extends BaseModelAuditable
{
    protected $fillable = [
        'title',
        'description',
        'keywords',
        'image_url',
        'created_by',
        'updated_by',
        'url' // this is the url of the page and is not stored in the database
    ];

    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'title' => 'array', // array<LangKey, string>
            'description' => 'array',
            'keywords' => 'array',  // array<LangKey, array<string>>
        ]);
    }
}
