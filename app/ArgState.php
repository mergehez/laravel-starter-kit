<?php

namespace App;

use App\Models\User;

class ArgState
{
    protected static ?User $loggedUser;
    protected static bool $checkedLoggedUser = false;

    public static function authNullable(): ?User
    {
        if (!self::$checkedLoggedUser) {
            self::$loggedUser = auth()->user();

            // if need to do something when user is set

            self::$checkedLoggedUser = true;
        }

        return self::$loggedUser;
    }

    /**
     * this is used when we are sure that user is logged in
     */
    public static function auth(): User
    {
        $user = self::authNullable();
        if (!$user) {
            abort(401, 'Unauthorized access');
        }

        return $user;
    }

    public static function isAdmin(): bool
    {
        $auth = self::authNullable();
        return $auth && $auth->isAdmin();
    }

    public static function isSuperAdmin(): bool
    {
        $auth = self::authNullable();
        return $auth && $auth->isSuperAdmin();
    }
}
