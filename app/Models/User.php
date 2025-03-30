<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Notifications\Notifiable;

class User extends BaseModelAuditableSoftDelete implements AuthenticatableContract, AuthorizableContract, CanResetPasswordContract
{
    use Authenticatable, Authorizable, CanResetPassword, MustVerifyEmail;
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'remember_token',
        'role',
        'active'
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'timestamp',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role == UserRole::admin || $this->isSuperAdmin();
    }

    public function isSuperAdmin(): bool
    {
        return $this->role == UserRole::superadmin;
    }
}
