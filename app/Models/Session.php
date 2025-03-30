<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Session extends BaseModel
{
    protected $table = 'sessions';

    public $timestamps = false;

    public function user(): BelongsTo // nullable
    {
        return $this->belongsTo(User::class);
    }
}
