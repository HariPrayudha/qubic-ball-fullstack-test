<?php

namespace App\Enums;

/**
 * Application roles used for authorization (RBAC).
 */
enum UserRole: string
{
    case User = 'user';
    case Admin = 'admin';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $role) => $role->value, self::cases());
    }
}
