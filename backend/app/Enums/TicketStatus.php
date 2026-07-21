<?php

namespace App\Enums;

/**
 * Lifecycle states a support ticket can be in.
 *
 * Backed by string values so they are stored/queried directly and
 * serialized predictably to the frontend.
 */
enum TicketStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';

    /**
     * All values as a plain array (handy for validation rules).
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }

    /** Human-friendly label for UI/display. */
    public function label(): string
    {
        return match ($this) {
            self::Open => 'Open',
            self::InProgress => 'In Progress',
            self::Resolved => 'Resolved',
        };
    }
}
