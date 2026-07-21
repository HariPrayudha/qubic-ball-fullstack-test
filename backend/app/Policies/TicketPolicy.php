<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

/**
 * Authorization rules for tickets.
 *
 * Regular users may only see and manage their own tickets; admins may
 * see everything and are the only ones allowed to change status or reply.
 */
class TicketPolicy
{
    /** Any authenticated user can list tickets (scope is applied in the query). */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /** A user may view a ticket they own; admins may view any ticket. */
    public function view(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin() || $ticket->user_id === $user->id;
    }

    /** Any authenticated (non-admin or admin) user may create a ticket. */
    public function create(User $user): bool
    {
        return true;
    }

    /** Only admins may change a ticket's status. */
    public function updateStatus(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin();
    }

    /** Only admins may respond to a ticket. */
    public function respond(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin();
    }
}
