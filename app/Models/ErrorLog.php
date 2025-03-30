<?php

namespace App\Models;

class ErrorLog extends BaseModelAuditable
{
    public const bool CREATED_BY = false;
    public const bool UPDATED_BY = false;

    protected $fillable = [
        'url',
        'route',
        'message',
        'count',
    ];
}
