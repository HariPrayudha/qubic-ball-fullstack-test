<?php

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/*
|--------------------------------------------------------------------------
| Authentication guard
|--------------------------------------------------------------------------
*/

it('rejects unauthenticated access to tickets', function () {
    $this->getJson('/api/tickets')->assertUnauthorized(); // 401
});

it('returns JSON 401 even when the client does not send an Accept header', function () {
    // Guards against the framework redirecting to a non-existent `login` route,
    // which would surface as a 500 for plain (non-JSON) API requests.
    $this->get('/api/tickets')
        ->assertUnauthorized()
        ->assertJson(['message' => 'Unauthenticated.']);
});

/*
|--------------------------------------------------------------------------
| Ticket creation + listing (API / integration)
|--------------------------------------------------------------------------
*/

it('creates a ticket for the authenticated user', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/tickets', [
        'subject' => 'Printer is on fire',
        'description' => 'Smoke is coming out of the office printer.',
    ]);

    $response->assertCreated() // 201
        ->assertJsonPath('data.subject', 'Printer is on fire')
        ->assertJsonPath('data.status', TicketStatus::Open->value)
        ->assertJsonPath('data.owner.id', $user->id);

    $this->assertDatabaseHas('tickets', [
        'subject' => 'Printer is on fire',
        'user_id' => $user->id,
        'status' => TicketStatus::Open->value,
    ]);
});

it('lists only the current user tickets and can filter by status', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    Ticket::factory()->for($user)->create(['status' => TicketStatus::Open]);
    Ticket::factory()->for($user)->inProgress()->create();
    Ticket::factory()->for($other)->create(); // must not appear

    Sanctum::actingAs($user);

    // All own tickets.
    $this->getJson('/api/tickets')
        ->assertOk()
        ->assertJsonCount(2, 'data');

    // Filtered by status.
    $this->getJson('/api/tickets?status=open')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.status', TicketStatus::Open->value);
});

it('admin can see tickets belonging to any user', function () {
    $admin = User::factory()->admin()->create();
    Ticket::factory()->count(3)->create(); // owned by random users

    Sanctum::actingAs($admin);

    $this->getJson('/api/tickets')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

/*
|--------------------------------------------------------------------------
| Input validation
|--------------------------------------------------------------------------
*/

it('validates ticket creation input', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/tickets', [
        'subject' => 'no',        // too short
        'description' => 'short', // too short
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['subject', 'description']);
});

it('rejects an invalid status value on update', function () {
    $admin = User::factory()->admin()->create();
    $ticket = Ticket::factory()->create();

    Sanctum::actingAs($admin);

    $this->patchJson("/api/tickets/{$ticket->id}/status", ['status' => 'archived'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['status']);
});

/*
|--------------------------------------------------------------------------
| Happy-path admin actions
|--------------------------------------------------------------------------
*/

it('admin can update ticket status and set resolved_at', function () {
    $admin = User::factory()->admin()->create();
    $ticket = Ticket::factory()->create(['status' => TicketStatus::Open]);

    Sanctum::actingAs($admin);

    $this->patchJson("/api/tickets/{$ticket->id}/status", [
        'status' => TicketStatus::Resolved->value,
    ])
        ->assertOk()
        ->assertJsonPath('data.status', TicketStatus::Resolved->value)
        ->assertJsonPath('data.resolved_at', fn ($v) => $v !== null);
});

it('admin can add a response to a ticket', function () {
    $admin = User::factory()->admin()->create();
    $ticket = Ticket::factory()->create();

    Sanctum::actingAs($admin);

    $this->postJson("/api/tickets/{$ticket->id}/responses", [
        'message' => 'We are looking into this now.',
    ])
        ->assertCreated()
        ->assertJsonPath('data.message', 'We are looking into this now.')
        ->assertJsonPath('data.author.id', $admin->id);

    $this->assertDatabaseHas('ticket_responses', [
        'ticket_id' => $ticket->id,
        'user_id' => $admin->id,
    ]);
});
