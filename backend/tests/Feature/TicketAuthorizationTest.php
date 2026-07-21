<?php

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('forbids a regular user from updating ticket status', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->create(['status' => TicketStatus::Open]);

    Sanctum::actingAs($user);

    $this->patchJson("/api/tickets/{$ticket->id}/status", [
        'status' => TicketStatus::Resolved->value,
    ])->assertForbidden(); // 403

    $this->assertDatabaseHas('tickets', [
        'id' => $ticket->id,
        'status' => TicketStatus::Open->value, // unchanged
    ]);
});

it('forbids a regular user from responding to a ticket', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->create();

    Sanctum::actingAs($user);

    $this->postJson("/api/tickets/{$ticket->id}/responses", [
        'message' => 'Trying to reply as a non-admin.',
    ])->assertForbidden(); // 403

    $this->assertDatabaseCount('ticket_responses', 0);
});

it('forbids a user from viewing another user ticket', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $ticket = Ticket::factory()->for($owner)->create();

    Sanctum::actingAs($intruder);

    $this->getJson("/api/tickets/{$ticket->id}")->assertForbidden(); // 403
});

it('allows the ticket owner to view their own ticket', function () {
    $owner = User::factory()->create();
    $ticket = Ticket::factory()->for($owner)->create();

    Sanctum::actingAs($owner);

    $this->getJson("/api/tickets/{$ticket->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $ticket->id);
});
