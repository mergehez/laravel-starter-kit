<?php

namespace App\Models;

use App\ArgState;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property ?User $creator
 * @property ?User $updater
 * @property int $created_by
 * @property int $created_at
 * @property int $updated_by
 * @property int $updated_at
 */
abstract class BaseModelAuditable extends BaseModel
{
    const bool CREATED_BY = true;
    const bool UPDATED_BY = true;

    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'created_at' => 'int',
            'updated_at' => 'int',
        ]);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public static function boot(): void
    {
        parent::boot();
        static::creating(function (BaseModelAuditable $model): void {
            $authId = ArgState::authNullable()?->id;
            if (!$authId) {
                return;
            }

            if ($model::CREATED_BY && !$model->created_by) {
                $model->created_by = $authId;
            }


            if ($model::CREATED_BY !== false && !$model->created_by) {
                $model->created_by = $authId;
            }
            if ($model::UPDATED_BY !== false && $model::UPDATED_AT && !$model->updated_by) {
                $model->updated_by = $authId;
            }
        });

        if (static::UPDATED_BY !== false && static::UPDATED_AT !== null) {
            static::updating(function (BaseModelAuditable $model): void {
                if (!$model->isDirty('updated_by')) {
                    $authId = ArgState::authNullable()?->id;
                    if ($authId) {
                        $model->updated_by = $authId;
                    }
                }
            });

            static::saved(function (BaseModelAuditable $model): void {
                $authId = ArgState::authNullable()?->id;

                if ($authId && $authId != $model->updated_by) {
                    $model->updated_by = $authId;
                    $model->save();
                }
            });
        }
    }
}
