<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketResponse;
use App\Models\User;

/**
 * Encapsulates ticket business logic so controllers stay thin.
 */
class TicketService
{
    /**
     * Create a ticket owned by the given user.
     *
     * @param  array{subject: string, description: string}  $data
     */
    public function create(User $user, array $data): Ticket
    {
        return $user->tickets()->create([
            'subject' => $data['subject'],
            'description' => $data['description'],
            'status' => TicketStatus::Open,
        ]);
    }

    /**
     * Change a ticket's status, keeping `resolved_at` in sync:
     * set it when moving to Resolved, clear it when moving away.
     */
    public function updateStatus(Ticket $ticket, TicketStatus $status): Ticket
    {
        $ticket->status = $status;
        $ticket->resolved_at = $status === TicketStatus::Resolved ? now() : null;
        $ticket->save();

        return $ticket;
    }

    /**
     * Attach a response authored by the given user to a ticket.
     */
    public function addResponse(Ticket $ticket, User $author, string $message): TicketResponse
    {
        return $ticket->responses()->create([
            'user_id' => $author->id,
            'message' => $message,
        ]);
    }
}
