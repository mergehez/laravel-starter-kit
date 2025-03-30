<?php

namespace App\Models;

class KeyValue extends BaseModelAuditable
{
    protected $fillable = [
        'key',
        'value',
    ];
}
