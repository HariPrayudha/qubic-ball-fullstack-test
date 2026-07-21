<?php

namespace Database\Factories;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'subject' => fake()->sentence(6),
            'description' => fake()->paragraph(),
            'status' => TicketStatus::Open,
            'resolved_at' => null,
        ];
    }

    /** Ticket currently being worked on. */
    public function inProgress(): static
    {
        return $this->state(fn () => ['status' => TicketStatus::InProgress]);
    }

    /** Ticket that has been resolved (sets resolved_at). */
    public function resolved(): static
    {
        return $this->state(fn () => [
            'status' => TicketStatus::Resolved,
            'resolved_at' => now(),
        ]);
    }
}
