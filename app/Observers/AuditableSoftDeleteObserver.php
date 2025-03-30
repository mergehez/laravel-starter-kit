<?php

namespace App\Observers;

use App\Models\BaseModelAuditableSoftDelete;

class AuditableSoftDeleteObserver
{
    // add filter to get not deleted data

    public function deleting(BaseModelAuditableSoftDelete $model): bool
    {
        $model->deleted_at = time();
        if ($model::DELETED_BY) {
            $model->deleted_by = auth()->check() ? auth()->user()?->id : null;
        }
        $model->save();

        return false;
    }

    public function restoring(BaseModelAuditableSoftDelete $model): void
    {
        $model->deleted_at = null;
        if ($model::DELETED_BY) {
            $model->deleted_by = null;
        }
    }
}
