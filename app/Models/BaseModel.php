<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\AbstractPaginator;

/**
 * @property int $id
 */
abstract class BaseModel extends Model
{
    public $timestamps = false;

    //    protected bool $softDeletable = false;
    protected $dateFormat = 'U'; // this is for saving to db

    protected function serializeDate(DateTimeInterface $date): int|string
    {
        dd('should not come here because "public $timestamps = false;"');
        //  return $date->getTimestamp();
    }

    public function scopePaginateWithQuery(Builder $query, $perPage = 20, $pageName = 'rupel'): AbstractPaginator
    {
        return $query->paginate($perPage, ['*'], $pageName)->withQueryString();
    }
}
