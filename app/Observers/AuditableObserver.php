<?php

namespace App\Observers;

use App\Models\BaseModelAuditable;

class AuditableObserver
{
    public function creating(BaseModelAuditable $model): void
    {
        if (! ($authId = $this->getAuthId())) {
            return;
        }
        if (! $model->created_by) {
            $model->created_by = $authId;
        }
        if ($model::UPDATED_AT && ! $model->updated_by) {
            $model->updated_by = $authId;
        }
    }

    protected function getAuthId(): ?int
    {
        return auth()->check() ? auth()->user()?->id : null;
    }

    public function updating(BaseModelAuditable $model): void
    {
        if ($model::UPDATED_AT && ! $model->isDirty('updated_by')) {
            $authId = $this->getAuthId();
            if ($authId) {
                $model->updated_by = $authId;
            }
        }
    }

    public function saved(BaseModelAuditable $model): void
    {
        if (! ($authId = $this->getAuthId())) {
            return;
        }
        if ($model::UPDATED_AT && $authId != $model->updated_by) {
            $model->updated_by = $authId;
            $model->save();
        }
    }
}
