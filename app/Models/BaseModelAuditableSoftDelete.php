<?php

namespace App\Models;

use App\ArgState;
use App\Observers\AuditableSoftDeleteObserver;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property ?User $deleter
 * @property ?int $deleted_by
 * @property ?int $deleted_at
 */
abstract class BaseModelAuditableSoftDelete extends BaseModelAuditable
{
    public const bool DELETED_AT = true;
    public const bool DELETED_BY = true;

    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'deleted_at' => 'int',
        ]);
    }

    public function deleter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    public function scopeWithTrashed(Builder $query)
    {
        return $query->withoutGlobalScope('not_deleted');
    }

    public function scopeWithTrashedIfAdmin(Builder $query)
    {
        if (ArgState::isAdmin()) {
            return $query->withoutGlobalScope('not_deleted');
        }
        return $query;
    }

    public static function boot(): void
    {
        parent::boot();
        static::addGlobalScope('not_deleted', function (Builder $query) {
            $query->whereNull($query->getModel()->getTable().'.deleted_at');
        });
        static::observe(new AuditableSoftDeleteObserver);
    }
}
