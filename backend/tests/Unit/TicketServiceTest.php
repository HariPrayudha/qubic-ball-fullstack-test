<?php

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Services\TicketService;

beforeEach(function () {
    $this->service = new TicketService();
});

it('sets resolved_at when a ticket is marked resolved', function () {
    $ticket = Ticket::factory()->create([
        'status' => TicketStatus::Open,
        'resolved_at' => null,
    ]);

    $this->service->updateStatus($ticket, TicketStatus::Resolved);

    expect($ticket->fresh())
        ->status->toBe(TicketStatus::Resolved)
        ->resolved_at->not->toBeNull();
});

it('clears resolved_at when a ticket moves away from resolved', function () {
    $ticket = Ticket::factory()->resolved()->create();

    expect($ticket->resolved_at)->not->toBeNull();

    $this->service->updateStatus($ticket, TicketStatus::InProgress);

    expect($ticket->fresh())
        ->status->toBe(TicketStatus::InProgress)
        ->resolved_at->toBeNull();
});
